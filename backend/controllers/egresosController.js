const Egreso = require("../models/Egreso");

// Obtener todos los egresos
const getEgresos = async (req, res) => {
  try {
    const egresos = await Egreso.find().sort({ fecha: -1 });
    res.json(egresos);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener egresos" });
  }
};

// Agregar nuevo egreso (ACTUALIZADO)
const addEgreso = async (req, res) => {
  try {
    const {
      descripcion,
      monto,
      fecha,
      categoria,
      tipoFlujo,
      fuente,
      fuenteTexto
    } = req.body;

    if (!descripcion || !monto || !fecha || !categoria || !tipoFlujo || !fuente) {
      return res.status(400).json({ error: "Todos los campos son obligatorios" });
    }

    const nuevoEgreso = new Egreso({
      descripcion,
      monto,
      fecha,
      categoria,
      tipoFlujo,
      fuente,
      fuenteTexto: fuente === "Otro" ? fuenteTexto : ""
    });

    await nuevoEgreso.save();
    res.status(201).json(nuevoEgreso);
  } catch (error) {
    console.error("Error al agregar egreso:", error);
    res.status(500).json({ error: "Error al agregar egreso" });
  }
};

// Eliminar egreso por ID
const deleteEgreso = async (req, res) => {
  try {
    await Egreso.findByIdAndDelete(req.params.id);
    res.status(200).json({ mensaje: "Egreso eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar egreso" });
  }
};

// Actualizar egreso por ID (ACTUALIZADO)
const updateEgreso = async (req, res) => {
  try {
    const {
      descripcion,
      monto,
      fecha,
      categoria,
      tipoFlujo,
      fuente,
      fuenteTexto
    } = req.body;

    if (!descripcion || !monto || !fecha || !categoria || !tipoFlujo || !fuente) {
      return res.status(400).json({ error: "Todos los campos son obligatorios para la actualización" });
    }

    const egresoActualizado = await Egreso.findByIdAndUpdate(
      req.params.id,
      {
        descripcion,
        monto,
        fecha,
        categoria,
        tipoFlujo,
        fuente,
        fuenteTexto: fuente === "Otro" ? fuenteTexto : ""
      },
      { new: true }
    );

    res.status(200).json(egresoActualizado);
  } catch (error) {
    console.error("Error al actualizar egreso:", error);
    res.status(500).json({ error: "Error al actualizar egreso" });
  }
};

// Exportar funciones
module.exports = {
  getEgresos,
  addEgreso,
  deleteEgreso,
  updateEgreso,
};
