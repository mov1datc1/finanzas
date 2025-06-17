const Tarea = require("../models/Tarea");

// Obtener todas las tareas
const getTareas = async (req, res) => {
  try {
    const tareas = await Tarea.find().sort({ fecha: -1 });
    res.json(tareas);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener tareas" });
  }
};

// Agregar nueva tarea
const addTarea = async (req, res) => {
  try {
    const { descripcion } = req.body;
    if (!descripcion) return res.status(400).json({ error: "Descripción requerida" });

    const nuevaTarea = new Tarea({ descripcion });
    await nuevaTarea.save();
    res.status(201).json(nuevaTarea);
  } catch (error) {
    res.status(500).json({ error: "Error al agregar tarea" });
  }
};

// Actualizar tarea
const updateTarea = async (req, res) => {
  try {
    const tareaActualizada = await Tarea.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(tareaActualizada);
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar tarea" });
  }
};

// Eliminar tarea
const deleteTarea = async (req, res) => {
  try {
    await Tarea.findByIdAndDelete(req.params.id);
    res.status(200).json({ mensaje: "Tarea eliminada correctamente" });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar tarea" });
  }
};

module.exports = {
  getTareas,
  addTarea,
  updateTarea,
  deleteTarea,
};
