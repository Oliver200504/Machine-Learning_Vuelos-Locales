const queries = require("../queries/retrasosAeroQueries");
const tensor = require("../services/retrasosAeroTensor");

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
// PUNTUALIDAD POR AEROPUERTO
//=====================================

async function obtenerPuntualidadAeropuerto(req,res){

    try{

        const datos = await queries.obtenerPuntualidadAeropuerto(

            req.query

        );

        res.json(datos);

    }

    catch(error){

        console.error(error);

        res.status(500).json({

            error:"Error al obtener gráfica de puntualidad."

        });

    }

}

//=====================================
// BURBUJAS
//=====================================

async function obtenerBurbujas(req,res){

    try{

        const datos = await queries.obtenerBurbujas(

            req.query

        );

        res.json(datos);

    }

    catch(error){

        console.error(error);

        res.status(500).json({

            error:"Error al obtener gráfica de burbujas."

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

            error:"Error al obtener gráfica de línea."

        });

    }

}

//=====================================
// ENTRENAR MODELO
//=====================================

async function entrenarModelo(req,res){

    try{

        await tensor.entrenarModelo();

        res.json({

            mensaje:"Modelo entrenado correctamente."

        });

    }

    catch(error){

        console.error(error);

        res.status(500).json({

            error:error.message

        });

    }

}

//=====================================
// PREDICCIÓN
//=====================================

async function obtenerPrediccion(req,res){

    try{

        const datos = await tensor.predecir15Meses(

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

//=====================================
// ESTADO DEL MODELO
//=====================================

async function obtenerEstadoModelo(req,res){

    try{

        res.json(

            tensor.obtenerInfoModelo()

        );

    }

    catch(error){

        console.error(error);

        res.status(500).json({

            error:error.message

        });

    }

}

//=====================================

module.exports={

    obtenerFiltros,

    obtenerKPIs,

    obtenerPuntualidadAeropuerto,

    obtenerBurbujas,

    obtenerLinea,

    entrenarModelo,

    obtenerPrediccion,

    obtenerEstadoModelo

};