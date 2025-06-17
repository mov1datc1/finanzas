const Tarea = require('../models/Tarea');
const dayjs = require('dayjs');

const obtenerMesActual = () => dayjs().format('YYYY-MM');
const obtenerMesAnterior = () => dayjs().subtract(1, 'month').format('YYYY-MM');

exports.obtenerTareas = async (req, res) => {
  try {
    const tareas = await Tarea.find();
    res.json(tareas);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener tareas' });
  }
};

exports.crearTarea = async (req, res) => {
  try {
    const fechaActual = new Date();
    const mesActual = fechaActual.getMonth(); // 0 = Enero
    const añoActual = fechaActual.getFullYear();

    const nuevaTarea = new Tarea({
      ...req.body,
      mes: mesActual,
      año: añoActual,
      completada: false // aseguras valor por defecto
    });

    await nuevaTarea.save();
    res.status(201).json(nuevaTarea);
  } catch (error) {
    console.error("Error al crear tarea:", error);
    res.status(500).json({ error: 'Error al crear tarea' });
  }
};


exports.actualizarTarea = async (req, res) => {
  try {
    const tarea = await Tarea.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(tarea);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar tarea' });
  }
};

exports.eliminarTarea = async (req, res) => {
  try {
    await Tarea.findByIdAndDelete(req.params.id);
    res.json({ mensaje: 'Tarea eliminada' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar tarea' });
  }
};

exports.clonarTareasMesAnterior = async (req, res) => {
  try {
    const mesActual = obtenerMesActual();
    const mesAnterior = obtenerMesAnterior();

    const yaExisten = await Tarea.find({ mes: mesActual });
    if (yaExisten.length > 0) {
      return res.status(200).json({ mensaje: 'Ya hay tareas para este mes' });
    }

    const tareasAnteriores = await Tarea.find({ mes: mesAnterior });
    const tareasClonadas = tareasAnteriores.map(t => ({
      descripcion: t.descripcion,
      completada: false,
      mes: mesActual
    }));

    await Tarea.insertMany(tareasClonadas);
    res.status(201).json({ mensaje: 'Tareas del mes anterior clonadas' });
  } catch (error) {
    res.status(500).json({ error: 'Error al clonar tareas' });
  }
};