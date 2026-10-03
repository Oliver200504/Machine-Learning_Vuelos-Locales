const express = require("express");

const router = express.Router();

const cancelacionesController = require(
    "../controllers/cancelacionesController"
);

//====================================
// FILTROS
//====================================

router.get(

    "/filtros",

    cancelacionesController.obtenerFiltros

);

//====================================
// KPIs
//====================================

router.get(

    "/kpis",

    cancelacionesController.obtenerKPIs

);

//====================================
// LÍNEA
//====================================

router.get(

    "/linea",

    cancelacionesController.obtenerLinea

);

//====================================
// BUBBLE
//====================================

router.get(

    "/bubble",

    cancelacionesController.obtenerBubbleChart

);

//====================================
// PASTEL
//====================================

router.get(

    "/pastel",

    cancelacionesController.obtenerPastel

);

//====================================
// PREDICCIÓN
//====================================

router.get(

    "/prediccion",

    cancelacionesController.obtenerPrediccion

);

module.exports = router;