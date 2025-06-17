const mongoose = require('mongoose');

const EgresoSchema = new mongoose.Schema({
  descripcion: { type: String, required: true },
  monto: { type: Number, required: true },
  fecha: { type: Date, required: true },
  categoria: { type: String, required: true },
  tipoFlujo: {
    type: String,
    enum: ["Operativo", "Inversión", "Financiamiento"],
    default: "Operativo",
    required: true
  },
  fuente: {
    type: String,
    enum: [
      'Bofa JP',
      'Wellsfargo RZ',
      'BBVA movida',
      'BBVA JP',
      'BBVA RZ',
      'Bofa RZ',
      'Chase JP',
      'Paypal Movida',
      'Paypal JP',
      'WISE movida',
      'Otro'
    ],
    required: true
  },
  fuenteTexto: {
    type: String,
    default: ''
  }
});

module.exports = mongoose.model('Egreso', EgresoSchema);
