const express = require("express");

const router = express.Router();

const controller = require(

    "../controllers/cancelacionesAeroController"

);

//--------------------------------------------------
// FILTROS
//--------------------------------------------------

router.get(

    "/filtros",

    controller.obtenerFiltros

);

//--------------------------------------------------
// KPIs
//--------------------------------------------------

router.get(

    "/kpis",

    controller.obtenerKPIs

);

//--------------------------------------------------
// GRÁFICA DE PASTEL
//--------------------------------------------------

router.get(

    "/pastel",

    controller.obtenerPastel

);

//--------------------------------------------------
// BARRAS VERTICALES
//--------------------------------------------------

router.get(

    "/aeropuertos",

    controller.obtenerAeropuertos

);

//--------------------------------------------------
// BARRAS HORIZONTALES
//--------------------------------------------------

router.get(

    "/estados",

    controller.obtenerEstados

);

//--------------------------------------------------

module.exports = router;