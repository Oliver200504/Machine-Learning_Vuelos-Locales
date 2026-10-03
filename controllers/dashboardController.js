const dashboardQueries = require("../queries/dashboardQueries");

//====================================
// CONSTRUIR FILTROS
//====================================

function construirFiltros(req){

    return{

        anioInicio: req.query.anioInicio || null,
        anioFin: req.query.anioFin || null,

        mesInicio: req.query.mesInicio || null,
        mesFin: req.query.mesFin || null,

        aerolinea: req.query.aerolinea || null,

        franja: req.query.franja || null,

        estado: req.query.estado || null,

        estadoVuelo: req.query.estadoVuelo || null,

        aeropuerto: req.query.aeropuerto || null,

        mesSeleccionado: req.query.mesSeleccionado || null

    };

}

//====================================
// KPIs
//====================================

const obtenerDashboardGeneral = async(req,res)=>{

    try{

        const filtros = construirFiltros(req);

        const datos = await dashboardQueries.obtenerKPIs(filtros);

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
// GRÁFICA DE ESTADO
//====================================

const obtenerEstadoVuelo = async(req,res)=>{

    try{

        const filtros = construirFiltros(req);

        const datos = await dashboardQueries.obtenerEstadoVuelo(filtros);

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
// GRÁFICA DE LÍNEAS
//====================================

const obtenerVuelosMes = async(req,res)=>{

    try{

        const filtros = construirFiltros(req);

        const datos = await dashboardQueries.obtenerVuelosMes(filtros);

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
// MAPA
//====================================

const obtenerMapaEstados = async(req,res)=>{

    try{

        const filtros = construirFiltros(req);

        const datos = await dashboardQueries.obtenerMapaEstados(filtros);

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
// FILTROS
//====================================

const obtenerFiltros = async(req,res)=>{

    try{

        const datos = await dashboardQueries.obtenerFiltros();

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

module.exports={

    obtenerDashboardGeneral,

    obtenerEstadoVuelo,

    obtenerVuelosMes,

    obtenerMapaEstados,

    obtenerFiltros

};