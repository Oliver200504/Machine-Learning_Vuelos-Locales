const pool = require("../database/conexion");

//=====================================
// CONSTRUIR WHERE
//=====================================

function construirWhere(filtros){

    const condiciones = [];

    const params = [];

    //--------------------------------------------------
    // AÑOS
    //--------------------------------------------------

    if(filtros.anioInicio){

        params.push(

            Number(filtros.anioInicio)

        );

        condiciones.push(

            `DF.ANIO >= $${params.length}`

        );

    }

    if(filtros.anioFin){

        params.push(

            Number(filtros.anioFin)

        );

        condiciones.push(

            `DF.ANIO <= $${params.length}`

        );

    }

    //--------------------------------------------------
    // MESES
    //--------------------------------------------------

    if(filtros.mesInicio){

        params.push(

            Number(filtros.mesInicio)

        );

        condiciones.push(

            `DF.MES >= $${params.length}`

        );

    }

    if(filtros.mesFin){

        params.push(

            Number(filtros.mesFin)

        );

        condiciones.push(

            `DF.MES <= $${params.length}`

        );

    }

    //--------------------------------------------------
    // AEROPUERTO
    //--------------------------------------------------

    if(filtros.aeropuerto){

        params.push(

            Number(filtros.aeropuerto)

        );

        condiciones.push(

            `(DR.SK_AEROPUERTO_ORIGEN = $${params.length}

            OR

            DR.SK_AEROPUERTO_DESTINO = $${params.length})`

        );

    }

    //--------------------------------------------------
    // FRANJA
    //--------------------------------------------------

    if(filtros.franja){

        params.push(

            filtros.franja.trim()

        );

        condiciones.push(

            `TRIM(DH.FRANJA_HORARIA) = $${params.length}`

        );

    }

    return{

        where:

            condiciones.length

                ? "WHERE " + condiciones.join(" AND ")

                : "",

        params

    };

}

//=====================================
// FROM FACT_VUELOS
//=====================================

function construirFromVuelos(where=""){

    return `

        FROM FACT_VUELOS FV

        INNER JOIN DIM_FECHA DF

            ON FV.SK_FECHA = DF.SK_FECHA

        INNER JOIN DIM_HORARIO DH

            ON FV.SK_HORARIO = DH.SK_HORARIO

        INNER JOIN DIM_RUTA DR

            ON FV.SK_RUTA = DR.SK_RUTA

        INNER JOIN DIM_AEROPUERTO DA

            ON DR.SK_AEROPUERTO_ORIGEN = DA.SK_AEROPUERTO

        ${where}

    `;

}

//=====================================
// FROM FACT_RETRASOS
//=====================================

function construirFromRetrasos(where=""){

    return `

        FROM FACT_RETRASOS FR

        INNER JOIN FACT_VUELOS FV

            ON FR.ID_HECHO = FV.ID_HECHO

        INNER JOIN DIM_MOTIVO_RETRASO DMR

            ON FR.SK_MOTIVO_RETRASO = DMR.SK_MOTIVO_RETRASO

        INNER JOIN DIM_FECHA DF

            ON FV.SK_FECHA = DF.SK_FECHA

        INNER JOIN DIM_HORARIO DH

            ON FV.SK_HORARIO = DH.SK_HORARIO

        INNER JOIN DIM_RUTA DR

            ON FV.SK_RUTA = DR.SK_RUTA

        INNER JOIN DIM_AEROPUERTO DA

            ON DR.SK_AEROPUERTO_ORIGEN = DA.SK_AEROPUERTO

        ${where}

    `;

}

//=====================================
// FILTROS
//=====================================

async function obtenerFiltros(){

    const anios = await pool.query(`

        SELECT DISTINCT

            ANIO

        FROM DIM_FECHA

        ORDER BY ANIO

    `);

    const aeropuertos = await pool.query(`

        SELECT

            SK_AEROPUERTO,

            CODIGO_AEROPUERTO

        FROM DIM_AEROPUERTO

        ORDER BY CODIGO_AEROPUERTO

    `);

    const franjas = await pool.query(`

        SELECT DISTINCT

            FRANJA_HORARIA

        FROM DIM_HORARIO

        ORDER BY FRANJA_HORARIA

    `);

    return{

        anios:

            anios.rows,

        aeropuertos:

            aeropuertos.rows,

        franjas:

            franjas.rows.map(

                x=>x.franja_horaria

            )

    };

}

//=====================================
// KPIs
//=====================================

async function obtenerKPIs(filtros){

    const filtro = construirWhere(filtros);

    //--------------------------------------------------
    // KPIs generales
    //--------------------------------------------------

    const sqlKPIs = `

        SELECT

            AVG(

                CASE

                    WHEN FV.RETRASO_LLEGADA <= 15

                    THEN 100

                    ELSE 0

                END

            ) AS puntualidad,

            AVG(

                CASE

                    WHEN FV.RETRASO_LLEGADA > 15

                    THEN FV.RETRASO_LLEGADA

                    ELSE NULL

                END

            ) AS promedio_retraso,

            SUM(

                CASE

                    WHEN FV.RETRASO_LLEGADA > 15

                    THEN 1

                    ELSE 0

                END

            ) AS vuelos_retrasados

        ${construirFromVuelos(filtro.where)}

    `;

    //--------------------------------------------------
    // Motivo principal
    //--------------------------------------------------

    const sqlMotivo = `

        SELECT

            DMR.NOMBRE

        ${construirFromRetrasos(filtro.where)}

        GROUP BY

            DMR.NOMBRE

        ORDER BY

            COUNT(*) DESC

        LIMIT 1

    `;

    //--------------------------------------------------
    // Aeropuerto con más retrasos
    //--------------------------------------------------

    const sqlAeropuerto = `

        SELECT

            DA.CODIGO_AEROPUERTO

        ${construirFromRetrasos(filtro.where)}

        GROUP BY

            DA.CODIGO_AEROPUERTO

        ORDER BY

            COUNT(*) DESC

        LIMIT 1

    `;

    //--------------------------------------------------
    // Ejecutar consultas
    //--------------------------------------------------

    const [

        kpis,

        motivo,

        aeropuerto

    ] = await Promise.all([

        pool.query(

            sqlKPIs,

            filtro.params

        ),

        pool.query(

            sqlMotivo,

            filtro.params

        ),

        pool.query(

            sqlAeropuerto,

            filtro.params

        )

    ]);

    //--------------------------------------------------
    // Resultado
    //--------------------------------------------------

    return{

        puntualidad:

            Number(

                kpis.rows[0]?.puntualidad || 0

            ),

        promedio_retraso:

            Number(

                kpis.rows[0]?.promedio_retraso || 0

            ),

        vuelos_retrasados:

            Number(

                kpis.rows[0]?.vuelos_retrasados || 0

            ),

        motivo_principal:

            motivo.rows.length

                ? motivo.rows[0].nombre

                : "Sin datos",

        aeropuerto_mas_retrasos:

            aeropuerto.rows.length

                ? aeropuerto.rows[0].codigo_aeropuerto

                : "Sin datos"

    };

}
//=====================================
// PUNTUALIDAD POR AEROPUERTO
//=====================================

async function obtenerPuntualidadAeropuerto(filtros){

    const filtro = construirWhere(filtros);

    const sql = `

        SELECT

            DA.SK_AEROPUERTO,

            DA.CODIGO_AEROPUERTO,

            AVG(

                CASE

                    WHEN FV.RETRASO_LLEGADA <= 15

                    THEN 100

                    ELSE 0

                END

            ) AS puntualidad,

            COUNT(*) AS total_vuelos

        ${construirFromVuelos(filtro.where)}

        GROUP BY

            DA.SK_AEROPUERTO,

            DA.CODIGO_AEROPUERTO

        ORDER BY

            puntualidad DESC

        LIMIT 10

    `;

    const resultado = await pool.query(

        sql,

        filtro.params

    );

    return resultado.rows;

}

//=====================================
// BURBUJAS
//=====================================

//=====================================
// BURBUJAS
//=====================================

async function obtenerBurbujas(filtros){

    const filtro = construirWhere(filtros);

    const sql = `

        SELECT

            DA.SK_AEROPUERTO,

            DA.CODIGO_AEROPUERTO,

            COUNT(*) AS total_vuelos,

            AVG(

                FV.RETRASO_LLEGADA

            ) AS promedio_retraso,

            SUM(

                CASE

                    WHEN FV.RETRASO_LLEGADA > 15

                    THEN 1

                    ELSE 0

                END

            ) AS vuelos_retrasados

        ${construirFromVuelos(filtro.where)}

        GROUP BY

            DA.SK_AEROPUERTO,

            DA.CODIGO_AEROPUERTO

        ORDER BY

            COUNT(*) DESC

    `;

    const resultado = await pool.query(

        sql,

        filtro.params

    );

    return resultado.rows;

}

//=====================================
// LÍNEA
//=====================================

//=====================================
// LÍNEA
//=====================================

async function obtenerLinea(filtros){

    const filtro = construirWhere(filtros);

    const sql = `

        SELECT

            DF.ANIO,

            DF.MES,

            CONCAT(

                DF.ANIO,

                '-',

                LPAD(

                    DF.MES::TEXT,

                    2,

                    '0'

                )

            ) AS periodo,

            SUM(

                CASE

                    WHEN FV.RETRASO_LLEGADA > 15

                    THEN 1

                    ELSE 0

                END

            )::INTEGER AS vuelos_retrasados

        ${construirFromVuelos(filtro.where)}

        GROUP BY

            DF.ANIO,

            DF.MES

        ORDER BY

            DF.ANIO,

            DF.MES

    `;

    const resultado = await pool.query(

        sql,

        filtro.params

    );

    return resultado.rows.map(fila=>({

        anio:Number(fila.anio),

        mes:Number(fila.mes),

        periodo:fila.periodo,

        vuelos_retrasados:Number(

            fila.vuelos_retrasados

        )

    }));

}

module.exports={

    construirWhere,

    construirFromVuelos,

    construirFromRetrasos,

    obtenerFiltros,

    obtenerKPIs,

    obtenerPuntualidadAeropuerto,

    obtenerBurbujas,

    obtenerLinea

};