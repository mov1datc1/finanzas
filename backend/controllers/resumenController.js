// controllers/resumenController.js
const Ingreso = require("../models/Ingreso");
const Egreso = require("../models/Egreso");

exports.obtenerResumenMensual = async (req, res) => {
  try {
    const { month, year } = req.query;
    const m = parseInt(month, 10);
    const y = parseInt(year, 10);

    // Traer todos los ingresos y egresos del mes seleccionado
    const desde = new Date(y, m - 1, 1);
    const hasta = new Date(y, m, 0, 23, 59, 59);

    const [ingresosMes, egresosMes] = await Promise.all([
      Ingreso.find({ fecha: { $gte: desde, $lte: hasta } }),
      Egreso.find({ fecha: { $gte: desde, $lte: hasta } }),
    ]);

    // Calcular saldo del mes anterior
    const mesAnt = m === 1 ? 12 : m - 1;
    const anioAnt = m === 1 ? y - 1 : y;
    const desdeAnt = new Date(anioAnt, mesAnt - 1, 1);
    const hastaAnt = new Date(anioAnt, mesAnt, 0, 23, 59, 59);

    const [ingresosAnt, egresosAnt] = await Promise.all([
      Ingreso.find({ fecha: { $gte: desdeAnt, $lte: hastaAnt } }),
      Egreso.find({ fecha: { $gte: desdeAnt, $lte: hastaAnt } }),
    ]);

    const totalIngAnt = ingresosAnt.reduce((sum, i) => sum + i.monto, 0);
    const totalEgrAnt = egresosAnt.reduce((sum, e) => sum + e.monto, 0);
    const saldoAnterior = totalIngAnt - totalEgrAnt;

    res.json({
      saldoAnterior,
      ingresos: ingresosMes,
      egresos: egresosMes,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al calcular resumen financiero" });
  }
};
