const express = require("express");

const router = express.Router();

const analisisRutaController = require(
    "../controllers/analisisRutaController"
);

//=====================================
// FILTROS
//=====================================

router.get(

    "/filtros",

    analisisRutaController.obtenerFiltros

);

//=====================================
// KPIs
//=====================================

router.get(

    "/kpis",

    analisisRutaController.obtenerKPIs

);

//=====================================
// TOP 10 RUTAS
//=====================================

router.get(

    "/top-rutas",

    analisisRutaController.obtenerTopRutas

);

//=====================================
// LÍNEA
//=====================================

router.get(

    "/linea",

    analisisRutaController.obtenerLinea

);

//=====================================
// MAPA
//=====================================

router.get(

    "/mapa",

    analisisRutaController.obtenerMapa

);

//=====================================

module.exports = router;