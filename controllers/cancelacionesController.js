const cancelacionesQueries = require("../queries/cancelacionesQueries");
const tensorflowService = require(
    "../services/tensorflowService"
);
//====================================
// FILTROS
//====================================

const obtenerFiltros = async(req,res)=>{

    try{

        const datos = await cancelacionesQueries.obtenerFiltros();

        res.json(datos);

    }

    catch(error){

        console.error(error);

        res.status(500).json({

            error:error.message

        });

    }

};

//====================================
// KPIs
//====================================

const obtenerKPIs = async(req,res)=>{

    try{

        const filtros={

            anioInicio:req.query.anioInicio || null,

            anioFin:req.query.anioFin || null,

            mesInicio:req.query.mesInicio || null,

            mesFin:req.query.mesFin || null,

            aerolinea:req.query.aerolinea || null,

            franja:req.query.franja || null,

            motivo:req.query.motivo || null

        };

        const datos = await cancelacionesQueries.obtenerKPIs(

            filtros

        );

        res.json(datos);

    }

    catch(error){

        console.error(error);

        res.status(500).json({

            error:error.message

        });

    }

};

//====================================
// LÍNEA
//====================================

const obtenerLinea = async(req,res)=>{

    try{

        const filtros={

            anioInicio:req.query.anioInicio || null,

            anioFin:req.query.anioFin || null,

            mesInicio:req.query.mesInicio || null,

            mesFin:req.query.mesFin || null,

            aerolinea:req.query.aerolinea || null,

            franja:req.query.franja || null,

            motivo:req.query.motivo || null

        };

        const datos = await tensorflowService.predecir15Meses(

    filtros

);

        res.json(datos);

    }

    catch(error){

        console.error(error);

        res.status(500).json({

            error:error.message

        });

    }

};

//====================================
// BUBBLE
//====================================

const obtenerBubbleChart = async(req,res)=>{

    try{

        const filtros={

            anioInicio:req.query.anioInicio || null,

            anioFin:req.query.anioFin || null,

            mesInicio:req.query.mesInicio || null,

            mesFin:req.query.mesFin || null,

            aerolinea:req.query.aerolinea || null,

            franja:req.query.franja || null,

            motivo:req.query.motivo || null

        };

        const datos = await cancelacionesQueries.obtenerBubbleChart(

            filtros

        );

        res.json(datos);

    }

    catch(error){

        console.error(error);

        res.status(500).json({

            error:error.message

        });

    }

};

//====================================
// PASTEL
//====================================

const obtenerPastel = async(req,res)=>{

    try{

        const filtros={

            anioInicio:req.query.anioInicio || null,

            anioFin:req.query.anioFin || null,

            mesInicio:req.query.mesInicio || null,

            mesFin:req.query.mesFin || null,

            aerolinea:req.query.aerolinea || null,

            franja:req.query.franja || null,

            motivo:req.query.motivo || null

        };

        const datos = await cancelacionesQueries.obtenerPastel(

            filtros

        );

        res.json(datos);

    }

    catch(error){

        console.error(error);

        res.status(500).json({

            error:error.message

        });

    }

};

const obtenerPrediccion = async(req,res)=>{

    try{

        const filtros={

            anioInicio:req.query.anioInicio || null,

            anioFin:req.query.anioFin || null,

            mesInicio:req.query.mesInicio || null,

            mesFin:req.query.mesFin || null,

            aerolinea:req.query.aerolinea || null,

            franja:req.query.franja || null,

            motivo:req.query.motivo || null

        };

        const datos = await cancelacionesQueries
            .obtenerPrediccion(filtros);

        res.json(datos);

    }

    catch(error){

        console.error(error);

        res.status(500).json({

            error:error.message

        });

    }

};

module.exports={

    obtenerFiltros,

    obtenerKPIs,

    obtenerLinea,

    obtenerBubbleChart,

    obtenerPrediccion,

    obtenerPastel

};