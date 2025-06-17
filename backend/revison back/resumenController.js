const Ingreso = require("../models/Ingreso");
const Egreso = require("../models/Egreso");
const dayjs = require("dayjs");

const obtenerEBITDA = async (req, res) => {
  try {
    const year = parseInt(req.query.year);

    const ingresos = await Ingreso.find({
      fecha: {
        $gte: new Date(`${year}-01-01`),
        $lte: new Date(`${year}-12-31`)
      },
    });

    const egresos = await Egreso.find({
      fecha: {
        $gte: new Date(`${year}-01-01`),
        $lte: new Date(`${year}-12-31`)
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

    for (let i = 0; i < 12; i++) {
      if (i > 0) {
        meses[i].ingresos += meses[i - 1].ebitda;

        const saldoAnteriorDescripcion = `Saldo anterior de ${dayjs().month(i - 1).format("MMMM").toUpperCase()} ${year}`;
        const yaExiste = await Ingreso.findOne({
          descripcion: saldoAnteriorDescripcion,
          fecha: {
            $gte: new Date(`${year}-${String(i + 1).padStart(2, '0')}-01`),
            $lt: new Date(`${year}-${String(i + 1).padStart(2, '0')}-31`),
          }
        });

        if (!yaExiste && meses[i - 1].ebitda !== 0) {
          await Ingreso.create({
            descripcion: saldoAnteriorDescripcion,
            monto: meses[i - 1].ebitda,
            fecha: new Date(`${year}-${String(i + 1).padStart(2, '0')}-01`),
            categoria: "Saldo anterior",
            tipoFlujo: "Operativo"
          });
        }
      }
      meses[i].ebitda = meses[i].ingresos - meses[i].egresos;
    }

    res.json(meses);
  } catch (error) {
    console.error("Error al calcular EBITDA:", error);
    res.status(500).json({ error: "Error al calcular EBITDA" });
  }
};

module.exports = { obtenerEBITDA };
