const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const parseAllowedOrigins = (value) => {
  if (!value) return undefined;

  const origins = value
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean);

  if (origins.length === 0 || origins.includes('*')) {
    return undefined;
  }

  return origins;
};

const allowedOrigins = parseAllowedOrigins(process.env.ALLOWED_ORIGINS);

const app = express();
app.use(cors({ origin: allowedOrigins ?? true }));
app.use(express.json());

// Importar rutas
const ingresosRoutes = require('./routes/ingresos');
const egresosRoutes = require('./routes/egresos');
const flujoCajaRoutes = require('./routes/flujoCaja');
const tareasRoutes = require('./routes/tareas');
const estadoResultadosRoutes = require('./routes/estadoResultados.routes');
const kpisRoutes = require('./routes/kpis');

// Montaje de rutas
app.use('/api/ingresos', ingresosRoutes);
app.use('/api/egresos', egresosRoutes);
app.use('/api/flujo-caja', flujoCajaRoutes);
app.use('/api/tareas', tareasRoutes);
app.use('/api', estadoResultadosRoutes);
app.use('/api', kpisRoutes);

// Ruta catch-all para 404
app.use((req, res) => {
  res.status(404).json({ error: `Ruta no encontrada: ${req.originalUrl}` });
});

// Conexión a MongoDB y arranque del servidor
const PORT = process.env.PORT ? Number(process.env.PORT) : 5000;
const { MONGO_URI } = process.env;

if (!MONGO_URI) {
  console.error('⚠️  MONGO_URI no está definido. No es posible iniciar el servidor.');
  process.exit(1);
}

mongoose.set('strictQuery', true);

const startServer = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    app.listen(PORT, () => console.log(`Servidor iniciado en puerto ${PORT}`));
  } catch (err) {
    console.error('Error al conectar MongoDB:', err);
    process.exit(1);
  }
};

if (require.main === module) {
  startServer();
}

module.exports = app;
module.exports.startServer = startServer;
