const pool = require("../database/conexion");

//=====================================
// FROM
//=====================================

function construirFrom(where=""){

    return `

        FROM FACT_VUELOS FV

        INNER JOIN DIM_FECHA DF

            ON FV.SK_FECHA = DF.SK_FECHA

        INNER JOIN DIM_AEROLINEA DA

            ON FV.SK_AEROLINEA = DA.SK_AEROLINEA

        INNER JOIN DIM_HORARIO DH

            ON FV.SK_HORARIO = DH.SK_HORARIO

        INNER JOIN DIM_RUTA DR

            ON FV.SK_RUTA = DR.SK_RUTA

        INNER JOIN DIM_AEROPUERTO AO

            ON DR.SK_AEROPUERTO_ORIGEN = AO.SK_AEROPUERTO

        INNER JOIN DIM_AEROPUERTO AD

            ON DR.SK_AEROPUERTO_DESTINO = AD.SK_AEROPUERTO

        ${where}

    `;

}

//=====================================
// WHERE
//=====================================

function construirWhere(filtros){

    const condiciones = [];

    const params = [];

    //--------------------------------------------------
    // Año
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
    // Mes
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
    // Aerolínea
    //--------------------------------------------------

    if(filtros.aerolinea){

        params.push(

            Number(filtros.aerolinea)

        );

        condiciones.push(

            `DA.SK_AEROLINEA = $${params.length}`

        );

    }

    //--------------------------------------------------
    // Franja horaria
    //--------------------------------------------------

    if(filtros.franja){

        params.push(

            filtros.franja.trim()

        );

        condiciones.push(

            `TRIM(DH.FRANJA_HORARIA) = $${params.length}`

        );

    }

    //--------------------------------------------------
    // Estado
    //--------------------------------------------------

    if(filtros.estado){

        params.push(

            filtros.estado.trim()

        );

        condiciones.push(

            `(
                TRIM(AO.ESTADO) = $${params.length}
                OR
                TRIM(AD.ESTADO) = $${params.length}
            )`

        );

    }

    //--------------------------------------------------

    return{

        where:

            condiciones.length

                ? "WHERE " + condiciones.join(" AND ")

                : "",

        params

    };

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

    const aerolineas = await pool.query(`

        SELECT

            SK_AEROLINEA,

            NOMBRE_AEROLINEA

        FROM DIM_AEROLINEA

        ORDER BY NOMBRE_AEROLINEA

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

        aerolineas:

            aerolineas.rows,

        franjas:

            franjas.rows.map(

                x=>x.franja_horaria

            )

    };

}

//=====================================
// KPIs
//=====================================

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

            COUNT(
                DISTINCT FV.SK_RUTA
            ) AS total_rutas,

            COALESCE(

                SUM(
                    FV.DISTANCIA
                ),

                0

            ) AS millas_recorridas,

            COALESCE(

                AVG(
                    FV.TIEMPO_REAL
                ),

                0

            ) AS tiempo_promedio,

            COALESCE(

                COUNT(*)::numeric
                /
                NULLIF(

                    COUNT(
                        DISTINCT AO.SK_AEROPUERTO
                    ),

                    0

                ),

                0

            ) AS promedio_vuelos

        ${construirFrom(filtro.where)}

    `;

    //--------------------------------------------------
    // Ruta más utilizada
    //--------------------------------------------------

    const sqlRuta = `

        SELECT

            CONCAT(

                AO.CODIGO_AEROPUERTO,

                ' → ',

                AD.CODIGO_AEROPUERTO

            ) AS ruta

        ${construirFrom(filtro.where)}

        GROUP BY

            AO.CODIGO_AEROPUERTO,

            AD.CODIGO_AEROPUERTO

        ORDER BY

            COUNT(*) DESC

        LIMIT 1

    `;

    //--------------------------------------------------
    // Ejecutar consultas
    //--------------------------------------------------

    const [

        kpis,

        ruta

    ] = await Promise.all([

        pool.query(

            sqlKPIs,

            filtro.params

        ),

        pool.query(

            sqlRuta,

            filtro.params

        )

    ]);

    //--------------------------------------------------
    // Resultado
    //--------------------------------------------------

    return{

        total_rutas:

            Number(

                kpis.rows[0].total_rutas || 0

            ),

        millas_recorridas:

            Number(

                kpis.rows[0].millas_recorridas || 0

            ),

        tiempo_promedio:

            Number(

                kpis.rows[0].tiempo_promedio || 0

            ),

        promedio_vuelos:

            Number(

                kpis.rows[0].promedio_vuelos || 0

            ),

        ruta_mas_utilizada:

            ruta.rows.length

                ? ruta.rows[0].ruta

                : "Sin datos"

    };

}

//=====================================
// VUELOS POR AEROLÍNEA
//=====================================

async function obtenerTopRutas(filtros){

    const filtro = construirWhere(filtros);

    const sql = `

        SELECT

            DA.SK_AEROLINEA,

            DA.NOMBRE_AEROLINEA AS aerolinea,

            COUNT(*) AS total_vuelos

        ${construirFrom(filtro.where)}

        GROUP BY

            DA.SK_AEROLINEA,

            DA.NOMBRE_AEROLINEA

        ORDER BY

            COUNT(*) DESC

        LIMIT 10

    `;

    const resultado = await pool.query(

        sql,

        filtro.params

    );

    return resultado.rows;

}

//=====================================
// DISTANCIA - PUNTUALIDAD - DESVIADOS
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

            AVG(

                FV.DISTANCIA

            ) AS distancia,

            AVG(

                CASE

                    WHEN FV.RETRASO_LLEGADA<=15

                    THEN 100

                    ELSE 0

                END

            ) AS puntualidad,

            SUM(

                CASE

                    WHEN FV.DESVIADO=1

                    THEN 1

                    ELSE 0

                END

            ) AS vuelos_desviados

        ${construirFrom(filtro.where)}

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

    return resultado.rows;

}

//=====================================
// MAPA
//=====================================

//=====================================
// MAPA
//=====================================

//=====================================
// MAPA
//=====================================

async function obtenerMapa(filtros){

    //--------------------------------------------------
    // El mapa NO se filtra por el estado seleccionado
    //--------------------------------------------------

    const filtrosMapa = {

        ...filtros,

        estado: null

    };

    const filtro = construirWhere(filtrosMapa);

    //--------------------------------------------------
    // Condición extra para limpiar estados
    //--------------------------------------------------

    const whereExtra = filtro.where

        ? `${filtro.where}
           AND TRIM(AO.ESTADO) <> ''`

        : `WHERE TRIM(AO.ESTADO) <> ''`;

    //--------------------------------------------------
    // Consulta
    //--------------------------------------------------

    const sql = `

        SELECT

            TRIM(AO.ESTADO) AS estado,

            COUNT(*) AS total_vuelos

        ${construirFrom(whereExtra)}

        GROUP BY

            TRIM(AO.ESTADO)

        ORDER BY

            COUNT(*) DESC

    `;

    const resultado = await pool.query(

        sql,

        filtro.params

    );

    return resultado.rows;

}

module.exports={

    construirFrom,

    construirWhere,

    obtenerFiltros,

    obtenerKPIs,

    obtenerTopRutas,

    obtenerLinea,

    obtenerMapa

};