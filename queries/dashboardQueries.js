const pool = require("../database/conexion");

/*
===========================================
CONSTRUCCIÓN DINÁMICA DEL WHERE
===========================================
*/

function construirWhere(filtros){

    let where = `
        WHERE 1=1
    `;

    const params = [];

    let indice = 1;

    /*
    ============================
    RANGO DE AÑOS
    ============================
    */

    if(filtros.anioInicio && filtros.anioFin){

        where += `
            AND DF.ANIO BETWEEN $${indice} AND $${indice+1}
        `;

        params.push(filtros.anioInicio);
        params.push(filtros.anioFin);

        indice += 2;

    }

    /*
    ============================
    RANGO DE MESES
    ============================
    */

    if(filtros.mesInicio && filtros.mesFin){

        where += `
            AND DF.MES BETWEEN $${indice} AND $${indice+1}
        `;

        params.push(filtros.mesInicio);
        params.push(filtros.mesFin);

        indice += 2;

    }

    /*
    ============================
    AEROLÍNEA
    ============================
    */

    if(filtros.aerolinea){

        where += `
            AND FV.SK_AEROLINEA = $${indice}
        `;

        params.push(filtros.aerolinea);

        indice++;

    }

    /*
    ============================
    FRANJA HORARIA
    ============================
    */

    if(filtros.franja){

        where += `
            AND DH.FRANJA_HORARIA = $${indice}
        `;

        params.push(filtros.franja);

        indice++;

    }

    /*
    ============================
    ESTADO DEL VUELO
    ============================
    */

    if(filtros.estadoVuelo){

        switch(filtros.estadoVuelo){

            case "COMPLETADO":

                where += `
                    AND FV.CANCELADO = 0
                    AND FV.DESVIADO = 0
                `;

                break;

            case "CANCELADO":

                where += `
                    AND FV.CANCELADO = 1
                `;

                break;

            case "DESVIADO":

                where += `
                    AND FV.DESVIADO = 1
                `;

                break;

            case "RETRASADO":

                where += `
                    AND (
                        FV.RETRASO_SALIDA > 0
                        OR FV.RETRASO_LLEGADA > 0
                    )
                `;

                break;

        }

    }

    /*
    ============================
    ESTADO (MAPA)
    ============================
    */

    if(filtros.estado){

        where += `
            AND TRIM(DA.ESTADO) = $${indice}
        `;

        params.push(filtros.estado);

        indice++;

    }

    /*
    ============================
    AEROPUERTO
    ============================
    */

    if(filtros.aeropuerto){

        where += `
            AND DR.SK_AEROPUERTO_ORIGEN = $${indice}
        `;

        params.push(filtros.aeropuerto);

        indice++;

    }

    /*
    ============================
    MES SELECCIONADO
    ============================
    */

    if(filtros.mesSeleccionado){

        where += `
            AND DF.MES = $${indice}
        `;

        params.push(filtros.mesSeleccionado);

        indice++;

    }

    return{

        where,
        params

    };

}

/*
===========================================
KPIs
===========================================
*/

async function obtenerKPIs(filtros){

    const filtro = construirWhere(filtros);

    const sql = `

        SELECT

            COUNT(*) AS total_vuelos,

            COALESCE(SUM(FV.DISTANCIA),0) AS millas_recorridas,

            ROUND(

                (

                    SUM(

                        CASE

                            WHEN FV.CANCELADO = 0
                             AND FV.RETRASO_SALIDA <= 0
                             AND FV.RETRASO_LLEGADA <= 0

                            THEN 1

                            ELSE 0

                        END

                    )::numeric

                    /

                    COUNT(*)

                ) * 100

            ,2) AS puntualidad,

            SUM(

                CASE

                    WHEN FV.DESVIADO = 1

                    THEN 1

                    ELSE 0

                END

            ) AS vuelos_desviados,

            ROUND(

                (

                    SUM(

                        CASE

                            WHEN FV.CANCELADO = 1

                            THEN 1

                            ELSE 0

                        END

                    )::numeric

                    /

                    COUNT(*)

                ) * 100

            ,2) AS porcentaje_cancelados,

            ROUND(

                (

                    SUM(

                        CASE

                            WHEN FV.RETRASO_SALIDA > 0
                              OR FV.RETRASO_LLEGADA > 0

                            THEN 1

                            ELSE 0

                        END

                    )::numeric

                    /

                    COUNT(*)

                ) * 100

            ,2) AS porcentaje_retrasados

        FROM Fact_Vuelos FV

        INNER JOIN Dim_Fecha DF
            ON FV.SK_FECHA = DF.SK_FECHA

        INNER JOIN Dim_Horario DH
            ON FV.SK_HORARIO = DH.SK_HORARIO

        INNER JOIN Dim_Ruta DR
            ON FV.SK_RUTA = DR.SK_RUTA

        INNER JOIN Dim_Aeropuerto DA
            ON DR.SK_AEROPUERTO_ORIGEN = DA.SK_AEROPUERTO

        ${filtro.where}

    `;

    const resultado = await pool.query(sql, filtro.params);

    return resultado.rows[0];

}


/* 

*/

async function obtenerEstadoVuelo(filtros){

    const filtro = construirWhere(filtros);

    const sql = `

        SELECT

            SUM(

                CASE

                    WHEN FV.CANCELADO = 0
                     AND FV.DESVIADO = 0

                    THEN 1

                    ELSE 0

                END

            ) AS completados,

            SUM(

                CASE

                    WHEN FV.CANCELADO = 1

                    THEN 1

                    ELSE 0

                END

            ) AS cancelados,

            SUM(

                CASE

                    WHEN FV.DESVIADO = 1

                    THEN 1

                    ELSE 0

                END

            ) AS desviados

        FROM Fact_Vuelos FV

        INNER JOIN Dim_Fecha DF
            ON FV.SK_FECHA = DF.SK_FECHA

        INNER JOIN Dim_Horario DH
            ON FV.SK_HORARIO = DH.SK_HORARIO

        INNER JOIN Dim_Ruta DR
            ON FV.SK_RUTA = DR.SK_RUTA

        INNER JOIN Dim_Aeropuerto DA
            ON DR.SK_AEROPUERTO_ORIGEN = DA.SK_AEROPUERTO

        ${filtro.where}

    `;

    const resultado = await pool.query(sql, filtro.params);

    return resultado.rows[0];

}

/*
===========================================
FILTROS
===========================================
*/

async function obtenerFiltros(){

    const anios = await pool.query(`
        SELECT DISTINCT anio
        FROM Dim_Fecha
        ORDER BY anio
    `);

    const meses = await pool.query(`

        SELECT DISTINCT

            mes,

            CASE

                WHEN mes=1 THEN 'Enero'
                WHEN mes=2 THEN 'Febrero'
                WHEN mes=3 THEN 'Marzo'
                WHEN mes=4 THEN 'Abril'
                WHEN mes=5 THEN 'Mayo'
                WHEN mes=6 THEN 'Junio'
                WHEN mes=7 THEN 'Julio'
                WHEN mes=8 THEN 'Agosto'
                WHEN mes=9 THEN 'Septiembre'
                WHEN mes=10 THEN 'Octubre'
                WHEN mes=11 THEN 'Noviembre'
                WHEN mes=12 THEN 'Diciembre'

            END nombre

        FROM Dim_Fecha

        ORDER BY mes

    `);

    const aerolineas = await pool.query(`

        SELECT

            sk_aerolinea,

            nombre_aerolinea

        FROM Dim_Aerolinea

        ORDER BY nombre_aerolinea

    `);

    const franjas = await pool.query(`

        SELECT DISTINCT franja_horaria

        FROM Dim_Horario

        ORDER BY franja_horaria

    `);

    return{

        anios:anios.rows,
        meses:meses.rows,
        aerolineas:aerolineas.rows,
        franjas:franjas.rows

    };

}

async function obtenerVuelosMes(filtros){

    const filtro = construirWhere(filtros);

    const sql = `

        SELECT

            DF.ANIO,

            DF.MES,

            CASE

                WHEN DF.MES = 1 THEN 'Enero'
                WHEN DF.MES = 2 THEN 'Febrero'
                WHEN DF.MES = 3 THEN 'Marzo'
                WHEN DF.MES = 4 THEN 'Abril'
                WHEN DF.MES = 5 THEN 'Mayo'
                WHEN DF.MES = 6 THEN 'Junio'
                WHEN DF.MES = 7 THEN 'Julio'
                WHEN DF.MES = 8 THEN 'Agosto'
                WHEN DF.MES = 9 THEN 'Septiembre'
                WHEN DF.MES = 10 THEN 'Octubre'
                WHEN DF.MES = 11 THEN 'Noviembre'
                WHEN DF.MES = 12 THEN 'Diciembre'

            END AS nombre_mes,

            COUNT(*) AS total

        FROM Fact_Vuelos FV

        INNER JOIN Dim_Fecha DF
            ON FV.SK_FECHA = DF.SK_FECHA

        INNER JOIN Dim_Horario DH
            ON FV.SK_HORARIO = DH.SK_HORARIO

        INNER JOIN Dim_Ruta DR
            ON FV.SK_RUTA = DR.SK_RUTA

        INNER JOIN Dim_Aeropuerto DA
            ON DR.SK_AEROPUERTO_ORIGEN = DA.SK_AEROPUERTO

        ${filtro.where}

        GROUP BY

            DF.ANIO,
            DF.MES

        ORDER BY

            DF.ANIO,
            DF.MES;

    `;

    const resultado = await pool.query(sql, filtro.params);

    return resultado.rows;

}

async function obtenerMapaEstados(filtros){

    const filtro = construirWhere(filtros);

    const sql = `

        SELECT

        TRIM(DA.ESTADO) AS estado,

            COUNT(*) AS total_vuelos,

            SUM(

                CASE

                    WHEN FV.RETRASO_SALIDA > 0
                      OR FV.RETRASO_LLEGADA > 0

                    THEN 1

                    ELSE 0

                END

            ) AS vuelos_retrasados,

            ROUND(

                (
                    SUM(

                        CASE

                            WHEN FV.RETRASO_SALIDA > 0
                              OR FV.RETRASO_LLEGADA > 0

                            THEN 1

                            ELSE 0

                        END

                    )::numeric

                    /

                    COUNT(*)

                )*100

            ,2) AS porcentaje_retrasados

        FROM Fact_Vuelos FV

        INNER JOIN Dim_Ruta DR

            ON FV.SK_RUTA = DR.SK_RUTA

        INNER JOIN Dim_Aeropuerto DA

            ON DR.SK_AEROPUERTO_ORIGEN = DA.SK_AEROPUERTO

        INNER JOIN Dim_Fecha DF

            ON FV.SK_FECHA = DF.SK_FECHA

        INNER JOIN Dim_Horario DH

            ON FV.SK_HORARIO = DH.SK_HORARIO

        ${filtro.where}

        GROUP BY

            DA.ESTADO

        ORDER BY

            porcentaje_retrasados DESC;

    `;

    const resultado = await pool.query(sql,filtro.params);

    return resultado.rows;

}

module.exports={

    obtenerKPIs,
    obtenerEstadoVuelo,
    obtenerVuelosMes,
    obtenerMapaEstados,
    obtenerFiltros

};