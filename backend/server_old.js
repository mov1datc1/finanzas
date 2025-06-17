const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
const estadoResultadosRoutes = require('./routes/estadoResultados.routes');
app.use('/api', estadoResultadosRoutes);

const tareasRoutes = require('./routes/tareas');
app.use('/api/tareas', tareasRoutes);

const kpisRoutes = require('./routes/kpis');
app.use('/api/kpis', kpisRoutes);



const flujoCajaRoutes = require('./routes/flujoCaja');



// Rutas
app.use('/api/ingresos', require('./routes/ingresos'));
app.use('/api/egresos', require('./routes/egresos'));
app.use('/api/flujo-caja', flujoCajaRoutes);
app.use('/api', estadoResultadosRoutes);

mongoose.connect(process.env.MONGO_URI)
.then(() => {
  app.listen(process.env.PORT, () => console.log('Servidor iniciado en puerto', process.env.PORT));
})
.catch(err => console.error('Error al conectar MongoDB:', err));
