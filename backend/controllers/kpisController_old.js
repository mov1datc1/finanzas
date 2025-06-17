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
      ebitda: 0 // puede calcularse luego si deseas mostrarlo
    }));

    ingresos.forEach(i => {
      const mes = new Date(i.fecha).getMonth();
      resumenMensual[mes].ingresos += i.monto;
    });

    egresos.forEach(e => {
      const mes = new Date(e.fecha).getMonth();
      resumenMensual[mes].egresos += e.monto;
    });

    // Cálculo simple de EBITDA como diferencia
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

    const egresos = await Egreso.find({
      fecha: { $gte: new Date(`${year}-01-01`), $lte: new Date(`${year}-12-31`) }
    });

    const tipos = {
      operativo: 0,
      inversion: 0,
      financiamiento: 0
    };

    egresos.forEach(e => {
      const tipo = e.tipoFlujo?.toLowerCase() || "operativo";
      if (tipos[tipo] !== undefined) {
        tipos[tipo] += e.monto;
      } else {
        tipos.operativo += e.monto;
      }
    });

    const total = Object.values(tipos).reduce((acc, val) => acc + val, 0);

    const resultado = Object.entries(tipos).map(([tipo, valor]) => ({
      tipo,
      valor,
      porcentaje: total > 0 ? (valor / total) * 100 : 0
    }));

    res.json(resultado);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener tipos de flujo" });
  }
};
