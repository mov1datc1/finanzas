const Ingreso = require("../models/Ingreso");
const Egreso = require("../models/Egreso");

const obtenerEBITDA = async (req, res) => {
  try {
    const year = parseInt(req.query.year);
    const ingresos = await Ingreso.find({
      fecha: {
        $gte: new Date(`${year}-01-01`),
        $lte: new Date(`${year}-12-31`),
      },
    });
    const egresos = await Egreso.find({
      fecha: {
        $gte: new Date(`${year}-01-01`),
        $lte: new Date(`${year}-12-31`),
      },
    });

    const meses = Array.from({ length: 12 }, (_, i) => ({
      mes: i + 1,
      ingresos: 0,
      egresos: 0,
      ebitda: 0,
    }));

    ingresos.forEach((ingreso) => {
      const mes = new Date(ingreso.fecha).getMonth();
      meses[mes].ingresos += ingreso.monto;
    });

    egresos.forEach((egreso) => {
      const mes = new Date(egreso.fecha).getMonth();
      meses[mes].egresos += egreso.monto;
    });

    meses.forEach((item) => {
      item.ebitda = item.ingresos - item.egresos;
    });

    res.json(meses);
  } catch (error) {
    res.status(500).json({ error: "Error al calcular EBITDA" });
  }
};

module.exports = { obtenerEBITDA };