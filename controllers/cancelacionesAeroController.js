const queries = require("../queries/cancelacionesAeroQueries");

//--------------------------------------------------
// FILTROS
//--------------------------------------------------

async function obtenerFiltros(req,res){

    try{

        const datos = await queries.obtenerFiltros();

        res.json(datos);

    }

    catch(error){

        console.error(error);

        res.status(500).json({

            error:error.message

        });

    }

}

//--------------------------------------------------
// KPIs
//--------------------------------------------------

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

            error:error.message

        });

    }

}

//--------------------------------------------------
// PASTEL
//--------------------------------------------------

async function obtenerPastel(req,res){

    try{

        const datos = await queries.obtenerPastel(

            req.query

        );

        res.json(datos);

    }

    catch(error){

        console.error(error);

        res.status(500).json({

            error:error.message

        });

    }

}

//--------------------------------------------------
// AEROPUERTOS
//--------------------------------------------------

async function obtenerAeropuertos(req,res){

    try{

        const datos = await queries.obtenerAeropuertos(

            req.query

        );

        res.json(datos);

    }

    catch(error){

        console.error(error);

        res.status(500).json({

            error:error.message

        });

    }

}

//--------------------------------------------------
// ESTADOS
//--------------------------------------------------

async function obtenerEstados(req,res){

    try{

        const datos = await queries.obtenerEstados(

            req.query

        );

        res.json(datos);

    }

    catch(error){

        console.error(error);

        res.status(500).json({

            error:error.message

        });

    }

}

//--------------------------------------------------

module.exports={

    obtenerFiltros,

    obtenerKPIs,

    obtenerPastel,

    obtenerAeropuertos,

    obtenerEstados

};