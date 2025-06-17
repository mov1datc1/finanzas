const express = require("express");
const router = express.Router();

const { getKPIsData, getTiposFlujo } = require("../controllers/kpisController");

router.get("/kpis", getKPIsData); // Ahora será accesible en /api/kpis
router.get("/flujo-tipos", getTiposFlujo); // Accesible en /api/flujo-tipos

module.exports = router;
