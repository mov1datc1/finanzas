// backend/routes/flujoCaja.js
const express = require("express");
const router = express.Router();
const Ingreso = require("../models/Ingreso");
const Egreso = require("../models/Egreso");

// GET /api/flujo-caja/anual/:anio
router.get("/anual/:anio", async (req, res) => {
  const anio = parseInt(req.params.anio);
  const resumenMensual = Array.from({ length: 12 }, (_, i) => ({
    mes: i + 1,
    ingresosOperativos: 0,
    egresosOperativos: 0,
    ingresosInversion: 0,
    egresosInversion: 0,
    ingresosFinancieros: 0,
    egresosFinancieros: 0,
    ebitda: 0,
  }));

  try {
    const ingresos = await Ingreso.find();
    const egresos = await Egreso.find();

    ingresos.forEach((ing) => {
      const fecha = new Date(ing.fecha);
      if (fecha.getFullYear() === anio) {
        const mes = fecha.getMonth();
        switch (ing.tipoFlujo) {
          case "Operativo":
            resumenMensual[mes].ingresosOperativos += ing.monto;
            break;
          case "Inversión":
            resumenMensual[mes].ingresosInversion += ing.monto;
            break;
          case "Financiamiento":
            resumenMensual[mes].ingresosFinancieros += ing.monto;
            break;
        }
      }
    });

    egresos.forEach((eg) => {
      const fecha = new Date(eg.fecha);
      if (fecha.getFullYear() === anio) {
        const mes = fecha.getMonth();
        switch (eg.tipoFlujo) {
          case "Operativo":
            resumenMensual[mes].egresosOperativos += eg.monto;
            break;
          case "Inversión":
            resumenMensual[mes].egresosInversion += eg.monto;
            break;
          case "Financiamiento":
            resumenMensual[mes].egresosFinancieros += eg.monto;
            break;
        }
      }
    });

    resumenMensual.forEach((fila) => {
      fila.ebitda = fila.ingresosOperativos - fila.egresosOperativos;
    });

    res.json(resumenMensual);
  } catch (error) {
    console.error("Error en flujo de caja:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

module.exports = router;
