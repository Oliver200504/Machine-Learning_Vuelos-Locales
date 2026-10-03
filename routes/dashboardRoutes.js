const express = require("express");

const router = express.Router();

const dashboardController = require("../controllers/dashboardController");

router.get("/general", dashboardController.obtenerDashboardGeneral);

router.get("/filtros", dashboardController.obtenerFiltros);

router.get("/estado-vuelo",dashboardController.obtenerEstadoVuelo);

router.get("/vuelos-mes",dashboardController.obtenerVuelosMes);

router.get("/mapa-estados",dashboardController.obtenerMapaEstados);

module.exports = router;