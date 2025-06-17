
const express = require("express");
const router = express.Router();
const { getEstadoResultados } = require("../controllers/estadoResultados.controller");

const { getEstadoMensual } = require("../controllers/estadoResultadosMensual.controller");
router.get("/estado-resultados/mensual/:anio", getEstadoMensual);

router.get("/estado-resultados/:anio", getEstadoResultados);

module.exports = router;
