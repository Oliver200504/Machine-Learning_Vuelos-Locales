const pool = require("../database/conexion");
//--------------------------------------------------
// WHERE
//--------------------------------------------------

//--------------------------------------------------
// WHERE
//--------------------------------------------------

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

            `(

                DR.SK_AEROPUERTO_ORIGEN = $${params.length}

                OR

                DR.SK_AEROPUERTO_DESTINO = $${params.length}

            )`

        );

    }

    //--------------------------------------------------
    // FRANJA HORARIA
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
    // MOTIVO DE CANCELACIÓN
    //--------------------------------------------------

    if(filtros.motivo){

        params.push(

            filtros.motivo.trim()

        );

        condiciones.push(

            `TRIM(DMC.MOTIVO_CANCELACION) = $${params.length}`

        );

    }

    //--------------------------------------------------
    // ESTADO
    //--------------------------------------------------

    if(filtros.estado){

        params.push(

            filtros.estado.trim()

        );

        condiciones.push(

            `TRIM(AO.ESTADO) = $${params.length}`

        );

    }

    //--------------------------------------------------
    // RESULTADO
    //--------------------------------------------------

    return{

        where:

            condiciones.length

                ? "WHERE " + condiciones.join(" AND ")

                : "",

        params

    };

}

//--------------------------------------------------
// FROM
//--------------------------------------------------

//--------------------------------------------------
// FROM
//--------------------------------------------------

function construirFrom(){

    return `

        FROM FACT_VUELOS FV

        INNER JOIN DIM_FECHA DF

            ON FV.SK_FECHA = DF.SK_FECHA

        INNER JOIN DIM_HORARIO DH

            ON FV.SK_HORARIO = DH.SK_HORARIO

        INNER JOIN DIM_RUTA DR

            ON FV.SK_RUTA = DR.SK_RUTA

        INNER JOIN DIM_AEROPUERTO AO

            ON DR.SK_AEROPUERTO_ORIGEN = AO.SK_AEROPUERTO

        INNER JOIN DIM_AEROPUERTO AD

            ON DR.SK_AEROPUERTO_DESTINO = AD.SK_AEROPUERTO

        INNER JOIN DIM_MOTIVO_CANCELADO DMC

            ON FV.SK_CANCELACION = DMC.SK_CANCELACION

        INNER JOIN DIM_AEROLINEA DEA

            ON FV.SK_AEROLINEA = DEA.SK_AEROLINEA

    `;

}

//--------------------------------------------------
// FILTROS
//--------------------------------------------------

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

//--------------------------------------------------
// KPIs
//--------------------------------------------------

//--------------------------------------------------
// KPIs
//--------------------------------------------------

//--------------------------------------------------
// KPIs
//--------------------------------------------------

async function obtenerKPIs(filtros){

    const filtro = construirWhere(filtros);

    //--------------------------------------------------
    // KPIs generales
    //--------------------------------------------------

    const sqlKPIs = `

        SELECT

            SUM(

                CASE

                    WHEN FV.CANCELADO = 1

                    THEN 1

                    ELSE 0

                END

            ) AS vuelos_cancelados,

            ROUND(

                (

                    SUM(

                        CASE

                            WHEN FV.CANCELADO = 1

                            THEN 1

                            ELSE 0

                        END

                    ) * 100.0

                )

                /

                NULLIF(

                    COUNT(*),

                    0

                ),

                2

            ) AS porcentaje_cancelados

        ${construirFrom()}

        ${

            filtro.where

                ? filtro.where

                : ""

        }

    `;

    //--------------------------------------------------
    // Motivo principal
    //--------------------------------------------------

    const sqlMotivo = `

        SELECT

            DMC.MOTIVO_CANCELACION

        ${construirFrom()}

        ${

            filtro.where

                ? filtro.where + " AND FV.CANCELADO = 1"

                : "WHERE FV.CANCELADO = 1"

        }

        GROUP BY

            DMC.MOTIVO_CANCELACION

        ORDER BY

            COUNT(*) DESC

        LIMIT 1

    `;

    //--------------------------------------------------
    // Aeropuerto con más cancelaciones
    //--------------------------------------------------

    const sqlAeropuerto = `

        SELECT

            AO.CODIGO_AEROPUERTO

        ${construirFrom()}

        ${

            filtro.where

                ? filtro.where + " AND FV.CANCELADO = 1"

                : "WHERE FV.CANCELADO = 1"

        }

        GROUP BY

            AO.CODIGO_AEROPUERTO

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

        vuelos_cancelados:

            Number(

                kpis.rows[0]?.vuelos_cancelados || 0

            ),

        porcentaje_cancelados:

            Number(

                kpis.rows[0]?.porcentaje_cancelados || 0

            ),

        motivo_principal:

            motivo.rows.length

                ? motivo.rows[0].motivo_cancelacion

                : "Sin datos",

        aeropuerto_mas_cancelaciones:

            aeropuerto.rows.length

                ? aeropuerto.rows[0].codigo_aeropuerto

                : "Sin datos"

    };

}


//--------------------------------------------------
// GRÁFICA DE PASTEL
//--------------------------------------------------

//--------------------------------------------------
// GRÁFICA DE PASTEL
//--------------------------------------------------

async function obtenerPastel(filtros){

    const filtro = construirWhere(filtros);

    const sql = `

        SELECT

            DMC.MOTIVO_CANCELACION AS motivo,

            COUNT(*) AS total_cancelaciones

        ${construirFrom()}

        ${

            filtro.where

                ? filtro.where + " AND FV.CANCELADO = 1"

                : "WHERE FV.CANCELADO = 1"

        }

        GROUP BY

            DMC.MOTIVO_CANCELACION

        ORDER BY

            COUNT(*) DESC

    `;

    const resultado = await pool.query(

        sql,

        filtro.params

    );

    return resultado.rows;

}

//--------------------------------------------------
// BARRAS VERTICALES
//--------------------------------------------------

//--------------------------------------------------
// BARRAS VERTICALES
//--------------------------------------------------

async function obtenerAeropuertos(filtros){

    const filtro = construirWhere(filtros);

    const sql = `

        SELECT

            AO.SK_AEROPUERTO,

            AO.CODIGO_AEROPUERTO,

            COUNT(*) AS total_cancelaciones

        ${construirFrom()}

        ${

            filtro.where

                ? filtro.where + " AND FV.CANCELADO = 1"

                : "WHERE FV.CANCELADO = 1"

        }

        GROUP BY

            AO.SK_AEROPUERTO,

            AO.CODIGO_AEROPUERTO

        ORDER BY

            COUNT(*) DESC

        LIMIT 20

    `;

    const resultado = await pool.query(

        sql,

        filtro.params

    );

    return resultado.rows;

}

//--------------------------------------------------
// BARRAS HORIZONTALES
//--------------------------------------------------

//--------------------------------------------------
// BARRAS HORIZONTALES
//--------------------------------------------------

async function obtenerEstados(filtros){

    const filtro = construirWhere(filtros);

    const sql = `

        SELECT

            TRIM(AO.ESTADO) AS estado,

            COUNT(*) AS total_cancelaciones

        ${construirFrom()}

        ${

            filtro.where

                ? filtro.where + " AND FV.CANCELADO = 1"

                : "WHERE FV.CANCELADO = 1"

        }

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

//--------------------------------------------------

module.exports={

    obtenerFiltros,

    obtenerKPIs,

    obtenerPastel,

    obtenerAeropuertos,

    obtenerEstados

};