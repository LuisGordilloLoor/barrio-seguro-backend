// Configuración de Express: middlewares, rutas y manejo de errores.
const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const { notFound, errorHandler } = require('./middlewares/errorHandler');

const app = express();

app.use(cors());          // Permite peticiones desde el frontend
app.use(express.json());  // Lee body JSON

// Ruta de verificación rápida
app.get('/', (req, res) => {
  res.json({ name: 'Barrio Seguro API', status: 'ok' });
});

app.use('/api', routes);

app.use(notFound);        // 404
app.use(errorHandler);    // Errores centralizados

module.exports = app;
