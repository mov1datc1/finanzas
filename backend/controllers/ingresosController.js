const Ingreso = require("../models/Ingreso");

// Obtener todos los ingresos
const getIngresos = async (req, res) => {
  try {
    const ingresos = await Ingreso.find().sort({ fecha: -1 });
    res.json(ingresos);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener ingresos" });
  }
};

// Agregar nuevo ingreso (ACTUALIZADO)
const addIngreso = async (req, res) => {
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

    // Validar campos obligatorios
    if (!descripcion || !monto || !fecha || !categoria || !tipoFlujo || !fuente) {
      return res.status(400).json({ error: "Todos los campos son obligatorios" });
    }

    const nuevoIngreso = new Ingreso({
      descripcion,
      monto,
      fecha,
      categoria,
      tipoFlujo,
      fuente,
      fuenteTexto: fuente === "Otro" ? fuenteTexto : ""
    });

    await nuevoIngreso.save();
    res.status(201).json(nuevoIngreso);
  } catch (error) {
    console.error("Error al agregar ingreso:", error);
    res.status(500).json({ error: "Error al agregar ingreso" });
  }
};

// Eliminar ingreso por ID
const deleteIngreso = async (req, res) => {
  try {
    await Ingreso.findByIdAndDelete(req.params.id);
    res.status(200).json({ mensaje: "Ingreso eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar ingreso" });
  }
};

// Actualizar ingreso por ID
const updateIngreso = async (req, res) => {
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

    const ingresoActualizado = await Ingreso.findByIdAndUpdate(
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

    res.status(200).json(ingresoActualizado);
  } catch (error) {
    console.error("Error al actualizar ingreso:", error);
    res.status(500).json({ error: "Error al actualizar ingreso" });
  }
};

module.exports = {
  getIngresos,
  addIngreso,
  deleteIngreso,
  updateIngreso,
};
