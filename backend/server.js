const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
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
app.use('/api', require('./routes/kpis')); 

// Ruta catch-all para 404
app.use((req, res) => {
  res.status(404).json({ error: `Ruta no encontrada: ${req.originalUrl}` });
});

// Conexión a MongoDB y arranque del servidor
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(process.env.PORT, () => console.log(`Servidor iniciado en puerto ${process.env.PORT}`));
  })
  .catch(err => console.error('Error al conectar MongoDB:', err));
