const mongoose = require("mongoose");

const TareaSchema = new mongoose.Schema({
  descripcion: { type: String, required: true },
  completada: { type: Boolean, default: false },
  fecha: { type: Date, default: Date.now },
  mes: { type: Number, required: true }, // 0 = Enero, 11 = Diciembre
  año: { type: Number, required: true }
});

module.exports = mongoose.model("Tarea", TareaSchema);
