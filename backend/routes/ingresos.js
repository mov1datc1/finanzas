const express = require('express');
const router = express.Router();
const {
  getIngresos,
  addIngreso,
  deleteIngreso,
  updateIngreso,
} = require('../controllers/ingresosController');

// Obtener todos los ingresos
router.get('/', getIngresos);

// Agregar nuevo ingreso
router.post('/', addIngreso);

// Eliminar un ingreso por ID
router.delete('/:id', deleteIngreso);

// Actualizar un ingreso por ID
router.put('/:id', updateIngreso);

module.exports = router;
