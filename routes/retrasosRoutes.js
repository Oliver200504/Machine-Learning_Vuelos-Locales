const express = require("express");

const router = express.Router();

const retrasosController = require("../controllers/retrasosController");

//====================================
// KPIs
//====================================

router.get(

    "/kpis",

    retrasosController.obtenerKPIs

);

//====================================
// FRANJA HORARIA
//====================================

router.get(

    "/franja",

    retrasosController.obtenerFranjaHoraria

);

//====================================
// BUBBLE CHART
//====================================

router.get(

    "/bubble",

    retrasosController.obtenerBubbleChart

);

//====================================
// TABLA
//====================================

router.get(

    "/tabla",

    retrasosController.obtenerTablaRetrasos

);

module.exports = router;