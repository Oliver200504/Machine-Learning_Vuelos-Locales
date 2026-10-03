const retrasosQueries = require("../queries/retrasosQueries");

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

            franja:req.query.franja || null

        };

        const datos = await retrasosQueries.obtenerKPIs(filtros);

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
// GRÁFICA FRANJA HORARIA
//====================================

const obtenerFranjaHoraria = async(req,res)=>{

    try{

        const filtros={

            anioInicio:req.query.anioInicio || null,

            anioFin:req.query.anioFin || null,

            mesInicio:req.query.mesInicio || null,

            mesFin:req.query.mesFin || null,

            aerolinea:req.query.aerolinea || null,

            franja:req.query.franja || null

        };

        const datos = await retrasosQueries.obtenerFranjaHoraria(filtros);

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
// BUBBLE CHART
//====================================

const obtenerBubbleChart = async(req,res)=>{

    try{

        const filtros={

            anioInicio:req.query.anioInicio || null,

            anioFin:req.query.anioFin || null,

            mesInicio:req.query.mesInicio || null,

            mesFin:req.query.mesFin || null,

            aerolinea:req.query.aerolinea || null,

            franja:req.query.franja || null

        };

        const datos = await retrasosQueries.obtenerBubbleChart(filtros);

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
// TABLA
//====================================

const obtenerTablaRetrasos = async(req,res)=>{

    try{

        const filtros={

            anioInicio:req.query.anioInicio || null,

            anioFin:req.query.anioFin || null,

            mesInicio:req.query.mesInicio || null,

            mesFin:req.query.mesFin || null,

            aerolinea:req.query.aerolinea || null,

            franja:req.query.franja || null

        };

        const datos = await retrasosQueries.obtenerTablaRetrasos(filtros);

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

    obtenerKPIs,

    obtenerFranjaHoraria,

    obtenerBubbleChart,

    obtenerTablaRetrasos

};