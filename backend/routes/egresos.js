const express = require('express');
const router = express.Router();
const {
  getEgresos,
  addEgreso,
  deleteEgreso,
  updateEgreso,
} = require('../controllers/egresosController');

// Obtener todos los egresos
router.get('/', getEgresos);

// Agregar nuevo egreso
router.post('/', addEgreso);

// Eliminar un egreso por ID
router.delete('/:id', deleteEgreso);

// Actualizar un egreso por ID
router.put('/:id', updateEgreso);

module.exports = router;
