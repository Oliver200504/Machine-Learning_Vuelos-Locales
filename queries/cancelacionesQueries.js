const pool = require("../database/conexion");

//====================================
// WHERE DINÁMICO
//====================================

function construirWhere(filtros){

    const where=[];

    const params=[];

    if(filtros.anioInicio){

        params.push(filtros.anioInicio);

        where.push(

            `DF.ANIO >= $${params.length}`

        );

    }

    if(filtros.anioFin){

        params.push(filtros.anioFin);

        where.push(

            `DF.ANIO <= $${params.length}`

        );

    }

    if(filtros.mesInicio){

        params.push(filtros.mesInicio);

        where.push(

            `DF.MES >= $${params.length}`

        );

    }

    if(filtros.mesFin){

        params.push(filtros.mesFin);

        where.push(

            `DF.MES <= $${params.length}`

        );

    }

    if(filtros.aerolinea){

        params.push(filtros.aerolinea);

        where.push(

            `FV.SK_AEROLINEA = $${params.length}`

        );

    }

    if(filtros.franja){

        params.push(filtros.franja);

        where.push(

            `DH.FRANJA_HORARIA = $${params.length}`

        );

    }

    if(filtros.motivo){

        params.push(filtros.motivo);

        where.push(

            `FV.SK_CANCELACION = $${params.length}`

        );

    }

    return{

        where:

            where.length

            ? "WHERE "+where.join(" AND ")

            : "",

        params

    };

}

//====================================
// FROM
//====================================

function construirFrom(where){

    return `

        FROM Fact_Vuelos FV

        INNER JOIN Dim_Fecha DF

            ON FV.SK_FECHA = DF.SK_FECHA

        INNER JOIN Dim_Horario DH

            ON FV.SK_HORARIO = DH.SK_HORARIO

        INNER JOIN Dim_Aerolinea DA

            ON FV.SK_AEROLINEA =
               DA.SK_AEROLINEA

        INNER JOIN Dim_Motivo_Cancelado DMC

            ON FV.SK_CANCELACION =
               DMC.SK_CANCELACION

        ${where}

    `;

}

//====================================
// WHERE CANCELACIONES
//====================================

function construirWhereCancelados(filtros){

    const filtro = construirWhere(filtros);

    let where = "WHERE FV.CANCELADO = 1";

    if(filtro.where){

        where += filtro.where.replace(

            "WHERE",

            " AND"

        );

    }

    return{

        where,

        params:filtro.params

    };

}

//====================================
// FILTROS
//====================================

async function obtenerFiltros(){

    const sql = `

        SELECT

            (
                SELECT json_agg(t)

                FROM(

                    SELECT DISTINCT

                        ANIO

                    FROM Dim_Fecha

                    ORDER BY ANIO

                ) t

            ) AS anios,

            (

                SELECT json_agg(t)

                FROM(

                    SELECT DISTINCT

                        MES

                    FROM Dim_Fecha

                    ORDER BY MES

                ) t

            ) AS meses,

            (

                SELECT json_agg(t)

                FROM(

                    SELECT

                        SK_AEROLINEA,

                        NOMBRE_AEROLINEA

                    FROM Dim_Aerolinea

                    ORDER BY NOMBRE_AEROLINEA

                ) t

            ) AS aerolineas,

            (

                SELECT json_agg(t)

                FROM(

                    SELECT DISTINCT

                        FRANJA_HORARIA

                    FROM Dim_Horario

                    ORDER BY FRANJA_HORARIA

                ) t

            ) AS franjas

    `;

    const resultado = await pool.query(sql);

    return resultado.rows[0];

}

//====================================
// KPIs
//====================================

async function obtenerKPIs(filtros){

const filtro = construirWhereCancelados(filtros);
    const sql = `

        SELECT

            ----------------------------------------
            -- Total de vuelos cancelados
            ----------------------------------------

            SUM(FV.CANCELADO) AS vuelos_cancelados,

            ----------------------------------------
            -- % de cancelaciones
            ----------------------------------------

            ROUND(

                (
                    SUM(FV.CANCELADO)::numeric

                    /

                    COUNT(*)

                ) * 100

            ,2) AS porcentaje_cancelados,

            ----------------------------------------
            -- Aerolínea con más cancelaciones
            ----------------------------------------

            (

                SELECT

                    DA2.NOMBRE_AEROLINEA

                FROM Fact_Vuelos FV2

                INNER JOIN Dim_Aerolinea DA2

                    ON FV2.SK_AEROLINEA = DA2.SK_AEROLINEA

                INNER JOIN Dim_Fecha DF

                    ON FV2.SK_FECHA = DF.SK_FECHA

                INNER JOIN Dim_Horario DH

                    ON FV2.SK_HORARIO = DH.SK_HORARIO

${filtro.where
    .replace(/FV\./g,"FV2.")
}
                GROUP BY

                    DA2.NOMBRE_AEROLINEA

                ORDER BY

                    COUNT(*) DESC

                LIMIT 1

            ) AS aerolinea_cancelaciones,

            ----------------------------------------
            -- Motivo principal
            ----------------------------------------

            (

                SELECT

                    DMC.MOTIVO_CANCELACION

                FROM Fact_Vuelos FV2

                INNER JOIN Dim_Motivo_Cancelado DMC

                    ON FV2.SK_CANCELACION = DMC.SK_CANCELACION

                INNER JOIN Dim_Fecha DF

                    ON FV2.SK_FECHA = DF.SK_FECHA

                INNER JOIN Dim_Horario DH

                    ON FV2.SK_HORARIO = DH.SK_HORARIO

${filtro.where
    .replace(/FV\./g,"FV2.")
}
                GROUP BY

                    DMC.MOTIVO_CANCELACION

                ORDER BY

                    COUNT(*) DESC

                LIMIT 1

            ) AS motivo_principal

        ${construirFrom(filtro.where)}

    `;

    const resultado = await pool.query(

        sql,

        filtro.params

    );

    return resultado.rows[0];

}

//====================================
// LÍNEA
//====================================

async function obtenerLinea(filtros){

    const filtro = construirWhereCancelados(filtros);

    const sql = `

        SELECT

            DF.ANIO,

            DF.MES,

            CONCAT(

                DF.ANIO,

                '-',

                LPAD(DF.MES::text,2,'0')

            ) AS PERIODO,

            COUNT(*) AS VUELOS_CANCELADOS

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

//====================================
// BUBBLE CHART
//====================================

async function obtenerBubbleChart(filtros){

    const filtro = construirWhere(filtros);

    const sql = `

        SELECT

            FV.SK_AEROLINEA,

            DA.NOMBRE_AEROLINEA,

            COUNT(*) AS TOTAL_VUELOS,

            SUM(FV.CANCELADO) AS VUELOS_CANCELADOS,

            ROUND(

                (
                    SUM(FV.CANCELADO)::numeric

                    /

                    COUNT(*)

                ) * 100

            ,2) AS PORCENTAJE_CANCELADOS

        ${construirFrom(filtro.where)}

        GROUP BY

            FV.SK_AEROLINEA,

            DA.NOMBRE_AEROLINEA

        ORDER BY

            TOTAL_VUELOS DESC

    `;

    const resultado = await pool.query(

        sql,

        filtro.params

    );

    return resultado.rows;

}

//====================================
// PASTEL
//====================================

async function obtenerPastel(filtros){

    const filtro = construirWhereCancelados(filtros);

    const sql = `

        SELECT

            FV.SK_CANCELACION,

            DMC.CODIGO_CANCELACION,

            DMC.MOTIVO_CANCELACION,

            COUNT(*) AS TOTAL

        ${construirFrom(filtro.where)}

        GROUP BY

            FV.SK_CANCELACION,

            DMC.CODIGO_CANCELACION,

            DMC.MOTIVO_CANCELACION

        ORDER BY

            TOTAL DESC

    `;

    const resultado = await pool.query(

        sql,

        filtro.params

    );

    return resultado.rows;

}



module.exports={

    obtenerFiltros,

    obtenerKPIs,

    obtenerLinea,

    obtenerBubbleChart,

    obtenerPastel

};