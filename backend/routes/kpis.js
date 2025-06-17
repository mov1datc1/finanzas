const express = require("express");
const router = express.Router();
const { getKPIsData, getTiposFlujo } = require("../controllers/kpisController");

router.get("/kpis", getKPIsData);
router.get("/flujo-tipos", getTiposFlujo);

module.exports = router;