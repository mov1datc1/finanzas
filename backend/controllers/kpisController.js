const Ingreso = require("../models/Ingreso");
const Egreso = require("../models/Egreso");

exports.getKPIsData = async (req, res) => {
  try {
    const year = parseInt(req.query.year);
    const ingresos = await Ingreso.find({
      fecha: { $gte: new Date(`${year}-01-01`), $lte: new Date(`${year}-12-31`) }
    });
    const egresos = await Egreso.find({
      fecha: { $gte: new Date(`${year}-01-01`), $lte: new Date(`${year}-12-31`) }
    });

    const resumenMensual = Array.from({ length: 12 }, (_, i) => ({
      mes: i + 1,
      ingresos: 0,
      egresos: 0,
      ebitda: 0
    }));

    ingresos.forEach(i => {
      const mes = new Date(i.fecha).getMonth();
      resumenMensual[mes].ingresos += i.monto;
    });

    egresos.forEach(e => {
      const mes = new Date(e.fecha).getMonth();
      resumenMensual[mes].egresos += e.monto;
    });

    resumenMensual.forEach(item => {
      item.ebitda = item.ingresos - item.egresos;
    });

    res.json(resumenMensual);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener KPIs" });
  }
};

exports.getTiposFlujo = async (req, res) => {
  try {
    const year = parseInt(req.query.year);
    const ingresos = await Ingreso.find({
      fecha: { $gte: new Date(`${year}-01-01`), $lte: new Date(`${year}-12-31`) }
    });
    const egresos = await Egreso.find({
      fecha: { $gte: new Date(`${year}-01-01`), $lte: new Date(`${year}-12-31`) }
    });

    const tipos = {
      Operativo: 0,
      Inversión: 0,
      Financiamiento: 0
    };

    ingresos.forEach(i => { tipos[i.tipoFlujo] = (tipos[i.tipoFlujo] || 0) + i.monto; });
    egresos.forEach(e => { tipos[e.tipoFlujo] = (tipos[e.tipoFlujo] || 0) + e.monto; });

    const total = Object.values(tipos).reduce((a, b) => a + b, 0);
    const resultado = Object.entries(tipos).map(([tipo, valor]) => ({
      tipo,
      valor,
      porcentaje: total ? (valor / total) * 100 : 0
    }));

    res.json(resultado);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener tipos de flujo" });
  }
};