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

  if (origins.length === 0) {
    return undefined;
  }

  return origins;
};

const escapeForRegExp = (value) => value.replace(/[|\\{}()[\]^$+?.]/g, '\\$&');

const convertPatternToRegExp = (pattern) => {
  if (pattern === '*') {
    return /.*/;
  }

  const escapedSegments = pattern
    .split('*')
    .map(segment => escapeForRegExp(segment));

  return new RegExp(`^${escapedSegments.join('.*')}$`);
};

const parseOriginPatterns = (value) => {
  if (!value) return [];

  return value
    .split(',')
    .map(pattern => pattern.trim())
    .filter(Boolean)
    .map(convertPatternToRegExp);
};

let allowedOrigins = parseAllowedOrigins(process.env.ALLOWED_ORIGINS);
const allowedOriginPatterns = parseOriginPatterns(process.env.ALLOWED_ORIGIN_PATTERNS);

if (Array.isArray(allowedOrigins) && allowedOrigins.includes('*')) {
  allowedOrigins = undefined;
}

const resolveAllowedOrigin = (origin) => {
  if (!origin) {
    return '*';
  }

  const hasExplicitOrigins = Array.isArray(allowedOrigins) && allowedOrigins.length > 0;
  const hasPatterns = allowedOriginPatterns.length > 0;

  if (!hasExplicitOrigins && !hasPatterns) {
    return '*';
  }

  if (hasExplicitOrigins && allowedOrigins.includes(origin)) {
    return origin;
  }

  if (hasPatterns && allowedOriginPatterns.some(pattern => pattern.test(origin))) {
    return origin;
  }

  return null;
};

const app = express();

const corsOptions = {
  origin: (origin, callback) => {
    const resolved = resolveAllowedOrigin(origin);

    if (resolved === '*') {
      return callback(null, true);
    }

    if (resolved) {
      return callback(null, true);
    }

    return callback(new Error(`Origen no permitido por CORS: ${origin || 'desconocido'}`));
  },
};

app.use(cors(corsOptions));
app.use(express.json());

app.use((req, res, next) => {
  const requestOrigin = req.headers.origin;
  const resolvedOrigin = resolveAllowedOrigin(requestOrigin);

  if (resolvedOrigin === '*') {
    res.setHeader('Access-Control-Allow-Origin', '*');
  } else if (resolvedOrigin) {
    res.setHeader('Access-Control-Allow-Origin', resolvedOrigin);
    res.append('Vary', 'Origin');
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');

  if (req.method === 'OPTIONS') {
    if (resolvedOrigin) {
      return res.sendStatus(204);
    }

    res.append('Vary', 'Origin');
    return res.status(403).json({ error: `Origen no permitido por CORS: ${requestOrigin || 'desconocido'}` });
  }

  next();
});

app.use((err, req, res, next) => {
  if (err instanceof Error && err.message.startsWith('Origen no permitido por CORS')) {
    const requestOrigin = req.headers.origin;
    const resolvedOrigin = resolveAllowedOrigin(requestOrigin);

    if (resolvedOrigin === '*') {
      res.setHeader('Access-Control-Allow-Origin', '*');
    } else if (resolvedOrigin) {
      res.setHeader('Access-Control-Allow-Origin', resolvedOrigin);
      res.append('Vary', 'Origin');
    } else {
      res.append('Vary', 'Origin');
    }

    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');

    return res.status(403).json({ error: err.message });
  }

  next(err);
});

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
