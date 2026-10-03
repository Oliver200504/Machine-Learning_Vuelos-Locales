const express = require("express");

const router = express.Router();

const controller = require("../controllers/retrasosAeroController");

//=====================================
// FILTROS
//=====================================

router.get(

    "/filtros",

    controller.obtenerFiltros

);

//=====================================
// KPIs
//=====================================

router.get(

    "/kpis",

    controller.obtenerKPIs

);

//=====================================
// PUNTUALIDAD
//=====================================

router.get(

    "/puntualidad",

    controller.obtenerPuntualidadAeropuerto

);

//=====================================
// BURBUJAS
//=====================================

router.get(

    "/burbujas",

    controller.obtenerBurbujas

);

//=====================================
// LÍNEA
//=====================================

router.get(

    "/linea",

    controller.obtenerLinea

);

//=====================================
// ENTRENAR MODELO
//=====================================

router.post(

    "/entrenar",

    controller.entrenarModelo

);

//=====================================
// PREDICCIÓN
//=====================================

router.get(

    "/prediccion",

    controller.obtenerPrediccion

);

//=====================================
// ESTADO DEL MODELO
//=====================================

router.get(

    "/modelo",

    controller.obtenerEstadoModelo

);

//=====================================

module.exports = router;