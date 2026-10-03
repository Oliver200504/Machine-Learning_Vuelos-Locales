const pool = require("../database/conexion");

//====================================
// CONSTRUIR WHERE
//====================================

function construirWhere(filtros){

    let where = `
        WHERE 1=1
    `;

    const params = [];

    let indice = 1;

    //============================
    // RANGO DE AÑOS
    //============================

    if(filtros.anioInicio && filtros.anioFin){

        where += `
            AND DF.ANIO BETWEEN $${indice} AND $${indice+1}
        `;

        params.push(filtros.anioInicio);
        params.push(filtros.anioFin);

        indice += 2;

    }

    //============================
    // RANGO DE MESES
    //============================

    if(filtros.mesInicio && filtros.mesFin){

        where += `
            AND DF.MES BETWEEN $${indice} AND $${indice+1}
        `;

        params.push(filtros.mesInicio);
        params.push(filtros.mesFin);

        indice += 2;

    }

    //============================
    // AEROLÍNEA
    //============================

    if(filtros.aerolinea){

        where += `
            AND FV.SK_AEROLINEA = $${indice}
        `;

        params.push(filtros.aerolinea);

        indice++;

    }

    //============================
    // FRANJA HORARIA
    //============================

    if(filtros.franja){

        where += `
            AND DH.FRANJA_HORARIA = $${indice}
        `;

        params.push(filtros.franja);

        indice++;

    }

    return{

        where,
        params

    };

}

//====================================
// FROM FACT_VUELOS
//====================================

function construirFromVuelos(where){

    return `

        FROM Fact_Vuelos FV

        INNER JOIN Dim_Fecha DF

            ON FV.SK_FECHA = DF.SK_FECHA

        INNER JOIN Dim_Horario DH

            ON FV.SK_HORARIO = DH.SK_HORARIO

        INNER JOIN Dim_Aerolinea DA

            ON FV.SK_AEROLINEA = DA.SK_AEROLINEA

        ${where}

    `;

}

//====================================
// FROM FACT_RETRASOS
//====================================

function construirFromRetrasos(where){

    return `

        FROM Fact_Retrasos FR

        INNER JOIN Fact_Vuelos FV

            ON FR.ID_HECHO = FV.ID_HECHO

        INNER JOIN Dim_Motivo_Retraso DMR

            ON FR.SK_MOTIVO_RETRASO =
               DMR.SK_MOTIVO_RETRASO

        INNER JOIN Dim_Fecha DF

            ON FV.SK_FECHA = DF.SK_FECHA

        INNER JOIN Dim_Horario DH

            ON FV.SK_HORARIO = DH.SK_HORARIO

        INNER JOIN Dim_Aerolinea DA

            ON FV.SK_AEROLINEA =
               DA.SK_AEROLINEA

        ${where}

    `;

}

//====================================
// KPIs
//====================================

async function obtenerKPIs(filtros){

    const filtro = construirWhere(filtros);

    //====================================
    // KPIs DESDE FACT_VUELOS
    //====================================

    const sqlVuelos = `

        SELECT

            COUNT(*) FILTER(

                WHERE FV.RETRASO_SALIDA > 0
                   OR FV.RETRASO_LLEGADA > 0

            ) AS vuelos_retrasados,

            ROUND(

                (

                    COUNT(*) FILTER(

                        WHERE FV.RETRASO_SALIDA > 0
                           OR FV.RETRASO_LLEGADA > 0

                    )::numeric

                    /

                    COUNT(*)

                ) * 100

            ,2) AS porcentaje_retrasados,

            (

                SELECT

                    DA.NOMBRE_AEROLINEA

                FROM Fact_Vuelos FV2

                INNER JOIN Dim_Aerolinea DA

                    ON FV2.SK_AEROLINEA = DA.SK_AEROLINEA

                INNER JOIN Dim_Fecha DF

                    ON FV2.SK_FECHA = DF.SK_FECHA

                INNER JOIN Dim_Horario DH

                    ON FV2.SK_HORARIO = DH.SK_HORARIO

                ${filtro.where.replace(/FV\./g,"FV2.")}

                GROUP BY

                    DA.NOMBRE_AEROLINEA

                ORDER BY

                    AVG(

                        GREATEST(

                            FV2.RETRASO_SALIDA,

                            FV2.RETRASO_LLEGADA

                        )

                    ) DESC

                LIMIT 1

            ) AS aerolinea_mayor_retraso

        ${construirFromVuelos(filtro.where)}

    `;

    //====================================
    // KPIs DESDE FACT_RETRASOS
    //====================================

    const sqlRetrasos = `

        SELECT

            COALESCE(

                SUM(FR.MINUTOS_RETRASO),

                0

            ) AS minutos_retraso,

            DMR.NOMBRE AS motivo_principal

        ${construirFromRetrasos(filtro.where)}

        GROUP BY

            DMR.NOMBRE

        ORDER BY

            SUM(FR.MINUTOS_RETRASO) DESC

        LIMIT 1

    `;

    //====================================
    // EJECUTAR CONSULTAS
    //====================================

    const vuelos = await pool.query(

        sqlVuelos,

        filtro.params

    );

    const retrasos = await pool.query(

        sqlRetrasos,

        filtro.params

    );

    //====================================
    // RESPUESTA
    //====================================

    return{

        aerolinea_mayor_retraso:

            vuelos.rows[0].aerolinea_mayor_retraso,

        porcentaje_retrasados:

            Number(
                vuelos.rows[0].porcentaje_retrasados
            ),

        vuelos_retrasados:

            Number(
                vuelos.rows[0].vuelos_retrasados
            ),

        minutos_retraso:

            Number(
                retrasos.rows[0]?.minutos_retraso ?? 0
            ),

        motivo_principal:

            retrasos.rows[0]?.motivo_principal ?? "-"

    };

}

//====================================
// RETRASOS POR FRANJA HORARIA
//====================================

async function obtenerFranjaHoraria(filtros){

    const filtro = construirWhere(filtros);

    const sql = `

        SELECT

            DH.FRANJA_HORARIA,

            SUM(FR.MINUTOS_RETRASO) AS MINUTOS

        ${construirFromRetrasos(filtro.where)}

        GROUP BY

            DH.FRANJA_HORARIA

        ORDER BY

            MINUTOS DESC

    `;

    const resultado = await pool.query(

        sql,

        filtro.params

    );

    return resultado.rows;

}

//====================================
// BUBBLE CHART
//====================================

//====================================
// BUBBLE CHART
//====================================

//====================================
// BUBBLE CHART
//====================================

async function obtenerBubbleChart(filtros){

    const filtro = construirWhere(filtros);

    const sql = `

        SELECT

            FV.SK_AEROLINEA AS sk_aerolinea,

            DA.NOMBRE_AEROLINEA AS nombre_aerolinea,

            COUNT(DISTINCT FV.ID_HECHO) AS total_vuelos,

            COUNT(DISTINCT FR.ID_HECHO) AS vuelos_retrasados,

            COALESCE(

                SUM(FR.MINUTOS_RETRASO),

                0

            ) AS total_minutos,

            ROUND(

                COALESCE(

                    AVG(FR.MINUTOS_RETRASO),

                    0

                )::numeric,

                2

            ) AS promedio_retraso

        ${construirFromRetrasos(filtro.where)}

        GROUP BY

            FV.SK_AEROLINEA,

            DA.NOMBRE_AEROLINEA

        ORDER BY

            total_vuelos DESC,

            nombre_aerolinea ASC

    `;

    const resultado = await pool.query(

        sql,

        filtro.params

    );

    return resultado.rows;

}

//====================================
// TABLA RETRASOS
//====================================

async function obtenerTablaRetrasos(filtros){

    const filtro = construirWhere(filtros);

    const sql = `

        SELECT *

        FROM (

            SELECT

                FV.SK_AEROLINEA AS sk_aerolinea,

                DA.NOMBRE_AEROLINEA AS aerolinea,

                COALESCE(SUM(
                    CASE
                        WHEN DMR.CODIGO_RETRASO='CARRIER'
                        THEN FR.MINUTOS_RETRASO
                        ELSE 0
                    END
                ),0) AS carrier,

                COALESCE(SUM(
                    CASE
                        WHEN DMR.CODIGO_RETRASO='WEATHER'
                        THEN FR.MINUTOS_RETRASO
                        ELSE 0
                    END
                ),0) AS weather,

                COALESCE(SUM(
                    CASE
                        WHEN DMR.CODIGO_RETRASO='NAS'
                        THEN FR.MINUTOS_RETRASO
                        ELSE 0
                    END
                ),0) AS nas,

                COALESCE(SUM(
                    CASE
                        WHEN DMR.CODIGO_RETRASO='SECURITY'
                        THEN FR.MINUTOS_RETRASO
                        ELSE 0
                    END
                ),0) AS security,

                COALESCE(SUM(
                    CASE
                        WHEN DMR.CODIGO_RETRASO='LATE_AIRCRAFT'
                        THEN FR.MINUTOS_RETRASO
                        ELSE 0
                    END
                ),0) AS late_aircraft,

                COALESCE(
                    SUM(FR.MINUTOS_RETRASO),
                    0
                ) AS total

            ${construirFromRetrasos(filtro.where)}

            GROUP BY

                FV.SK_AEROLINEA,

                DA.NOMBRE_AEROLINEA

            UNION ALL

            SELECT

                NULL AS sk_aerolinea,

                'Total' AS aerolinea,

                COALESCE(SUM(
                    CASE
                        WHEN DMR.CODIGO_RETRASO='CARRIER'
                        THEN FR.MINUTOS_RETRASO
                        ELSE 0
                    END
                ),0) AS carrier,

                COALESCE(SUM(
                    CASE
                        WHEN DMR.CODIGO_RETRASO='WEATHER'
                        THEN FR.MINUTOS_RETRASO
                        ELSE 0
                    END
                ),0) AS weather,

                COALESCE(SUM(
                    CASE
                        WHEN DMR.CODIGO_RETRASO='NAS'
                        THEN FR.MINUTOS_RETRASO
                        ELSE 0
                    END
                ),0) AS nas,

                COALESCE(SUM(
                    CASE
                        WHEN DMR.CODIGO_RETRASO='SECURITY'
                        THEN FR.MINUTOS_RETRASO
                        ELSE 0
                    END
                ),0) AS security,

                COALESCE(SUM(
                    CASE
                        WHEN DMR.CODIGO_RETRASO='LATE_AIRCRAFT'
                        THEN FR.MINUTOS_RETRASO
                        ELSE 0
                    END
                ),0) AS late_aircraft,

                COALESCE(
                    SUM(FR.MINUTOS_RETRASO),
                    0
                ) AS total

            ${construirFromRetrasos(filtro.where)}

        ) AS tabla

        ORDER BY

            CASE

                WHEN tabla.sk_aerolinea IS NULL

                THEN 1

                ELSE 0

            END,

            tabla.total DESC

    `;

    const resultado = await pool.query(

        sql,

        filtro.params

    );

    return resultado.rows;

}
//====================================

module.exports={

    obtenerKPIs,

    obtenerFranjaHoraria,

    obtenerBubbleChart,

    obtenerTablaRetrasos

};