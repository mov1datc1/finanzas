const express = require("express");
const router = express.Router();
const { obtenerEBITDA } = require("../controllers/resumenController");

router.get("/ebitda", obtenerEBITDA);

module.exports = router;