const Ingreso = require("../models/Ingreso");
const Egreso = require("../models/Egreso");

exports.getEstadoResultados = async (req, res) => {
  const anio = parseInt(req.params.anio);

  const start = new Date(`${anio}-01-01T00:00:00.000Z`);
  const end = new Date(`${anio}-12-31T23:59:59.999Z`);

  try {
    const ingresos = await Ingreso.find({ fecha: { $gte: start, $lte: end } });
    const egresos = await Egreso.find({ fecha: { $gte: start, $lte: end } });

    // Función de suma por tipoFlujo (usando mayúscula inicial correctamente)
    const suma = (docs, tipo) =>
      docs.filter((doc) => doc.tipoFlujo === tipo).reduce((acc, curr) => acc + curr.monto, 0);

    // Ingresos
    const ingresosTotales = ingresos.reduce((acc, i) => acc + i.monto, 0);
    const ingresosOperativos = suma(ingresos, "Operativo");
    const ingresosFinancieros = suma(ingresos, "Financiamiento");
    const ingresosInversion = suma(ingresos, "Inversión");

    // Egresos
    const egresosTotales = egresos.reduce((acc, e) => acc + e.monto, 0);
    const egresosOperativos = suma(egresos, "Operativo");
    const egresosFinancieros = suma(egresos, "Financiamiento");
    const egresosInversion = suma(egresos, "Inversión");

    // Cálculos
    const margenBruto = ingresosOperativos;
    const gastoOperativo = egresosOperativos;
    const tributos = egresosFinancieros * 0.1; // Simulación
    const impuestos = egresosInversion * 0.15; // Simulación

    const ebitda = margenBruto - gastoOperativo;
    const ebit = ebitda - tributos;
    const beneficioNeto = ebit - impuestos;
    const flujoCaja = ingresosTotales - egresosTotales;

    res.json({
      ingresos: ingresosTotales,
      margenBruto,
      gastoOperativo,
      tributos,
      ebitda,
      ebit,
      impuestos,
      beneficioNeto,
      flujoCaja
    });
  } catch (error) {
    console.error("Error en estado de resultados:", error);
    res.status(500).json({ error: "Error al obtener estado de resultados" });
  }
};
