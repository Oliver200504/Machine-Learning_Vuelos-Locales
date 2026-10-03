const queries = require("../queries/analisisRutaQueries");

//=====================================
// FILTROS
//=====================================

async function obtenerFiltros(req,res){

    try{

        const datos = await queries.obtenerFiltros();

        res.json(datos);

    }

    catch(error){

        console.error(error);

        res.status(500).json({

            error:"Error al obtener filtros."

        });

    }

}

//=====================================
// KPIs
//=====================================

async function obtenerKPIs(req,res){

    try{

        const datos = await queries.obtenerKPIs(

            req.query

        );

        res.json(datos);

    }

    catch(error){

        console.error(error);

        res.status(500).json({

            error:"Error al obtener KPIs."

        });

    }

}

//=====================================
// TOP 10
//=====================================

async function obtenerTopRutas(req,res){

    try{

        const datos = await queries.obtenerTopRutas(

            req.query

        );

        res.json(datos);

    }

    catch(error){

        console.error(error);

        res.status(500).json({

            error:"Error al obtener Top 10."

        });

    }

}

//=====================================
// LÍNEA
//=====================================

async function obtenerLinea(req,res){

    try{

        const datos = await queries.obtenerLinea(

            req.query

        );

        res.json(datos);

    }

    catch(error){

        console.error(error);

        res.status(500).json({

            error:"Error al obtener línea."

        });

    }

}

//=====================================
// MAPA
//=====================================

async function obtenerMapa(req,res){

    try{

        const datos = await queries.obtenerMapa(

            req.query

        );

        res.json(datos);

    }

    catch(error){

        console.error(error);

        res.status(500).json({

            error:"Error al obtener mapa."

        });

    }

}

//=====================================

module.exports={

    obtenerFiltros,

    obtenerKPIs,

    obtenerTopRutas,

    obtenerLinea,

    obtenerMapa

};