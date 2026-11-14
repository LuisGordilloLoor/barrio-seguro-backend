// Manejo centralizado de errores y rutas no encontradas.
const HttpError = require('../utils/httpError');

// 404 para rutas que no existen
function notFound(req, res, next) {
  next(new HttpError(404, `Ruta no encontrada: ${req.method} ${req.originalUrl}`));
}

// Middleware final: convierte cualquier error en una respuesta JSON uniforme
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  // JSON mal formado en el body
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'El cuerpo de la petición no es un JSON válido.' });
  }

  const status = err.status || 500;
  if (status === 500) console.error(err);

  const body = {
    error: status === 500 && process.env.NODE_ENV === 'production'
      ? 'Error interno del servidor.'
      : err.message || 'Error interno del servidor.',
  };
  if (err.details) body.details = err.details;

  res.status(status).json(body);
}

module.exports = { notFound, errorHandler };
