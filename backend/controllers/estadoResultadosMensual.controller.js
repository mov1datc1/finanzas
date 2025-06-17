const Ingreso = require("../models/Ingreso");
const Egreso = require("../models/Egreso");

exports.getEstadoMensual = async (req, res) => {
  const { anio } = req.params;

  try {
    const ingresosMensuales = await Ingreso.aggregate([
      {
        $match: {
          fecha: {
            $gte: new Date(`${anio}-01-01`),
            $lte: new Date(`${anio}-12-31`)
          }
        }
      },
      {
        $group: {
          _id: {
            mes: { $month: "$fecha" },
            tipoFlujo: "$tipoFlujo"
          },
          total: { $sum: "$monto" }
        }
      }
    ]);

    const egresosMensuales = await Egreso.aggregate([
      {
        $match: {
          fecha: {
            $gte: new Date(`${anio}-01-01`),
            $lte: new Date(`${anio}-12-31`)
          }
        }
      },
      {
        $group: {
          _id: {
            mes: { $month: "$fecha" },
            tipoFlujo: "$tipoFlujo"
          },
          total: { $sum: "$monto" }
        }
      }
    ]);

    const mensual = Array(12).fill(0).map((_, i) => {
      const mes = i + 1;

      const getMonto = (arr, tipo) =>
        arr.find(m => m._id.mes === mes && m._id.tipoFlujo === tipo)?.total || 0;

      // Ingresos
      const ingresosOperativos = getMonto(ingresosMensuales, "Operativo");
      const ingresosFinancieros = getMonto(ingresosMensuales, "Financiamiento");
      const ingresosInversion = getMonto(ingresosMensuales, "Inversión");
      const ingresosTotales = ingresosOperativos + ingresosFinancieros + ingresosInversion;

      // Egresos
      const egresosOperativos = getMonto(egresosMensuales, "Operativo");
      const egresosFinancieros = getMonto(egresosMensuales, "Financiamiento");
      const egresosInversion = getMonto(egresosMensuales, "Inversión");
      const egresosTotales = egresosOperativos + egresosFinancieros + egresosInversion;

      // KPIs
      const margenBruto = ingresosOperativos;
      const gastoOperativo = egresosOperativos;
      const tributos = egresosFinancieros * 0.1;
      const impuestos = egresosInversion * 0.15;
      const ebitda = margenBruto - gastoOperativo;
      const ebit = ebitda - tributos;
      const beneficioNeto = ebit - impuestos;
      const flujoCaja = ingresosTotales - egresosTotales;

      return {
        ingresos: ingresosTotales,
        egresos: egresosTotales,
        margenBruto,
        gastoOperativo,
        tributos,
        ebitda,
        ebit,
        impuestos,
        beneficioNeto,
        flujoCaja
      };
    });

    res.json(mensual);
  } catch (error) {
    console.error("Error en estado mensual:", error);
    res.status(500).json({ message: "Error al obtener el estado mensual." });
  }
};
