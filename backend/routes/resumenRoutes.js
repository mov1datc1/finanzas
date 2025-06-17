// routes/resumen.routes.js
const express = require("express");
const router = express.Router();
const { obtenerResumenMensual } = require("../controllers/resumenController");

// GET /api/resumen?month=6&year=2025
router.get("/resumen", obtenerResumenMensual);

module.exports = router;
