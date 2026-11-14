// Controladores de reportes: validan la entrada y delegan en el service.
const reportsService = require('../services/reports.service');
const HttpError = require('../utils/httpError');

const VALID_STATUSES = ['RECIBIDO', 'EN_REVISION', 'EN_ATENCION', 'RESUELTO'];

// Devuelve el texto limpio si es un string no vacío; si no, null
function cleanString(value) {
  return typeof value === 'string' && value.trim() !== '' ? value.trim() : null;
}

// POST /api/reports
async function createReport(req, res, next) {
  try {
    const body = req.body || {};
    const errors = [];

    // Solo se leen los campos permitidos: no se almacenan datos personales
    const title = cleanString(body.title);
    const category = cleanString(body.category);
    const description = cleanString(body.description);
    const sector = cleanString(body.sector);
    const latitude = body.latitude === '' ? NaN : Number(body.latitude);
    const longitude = body.longitude === '' ? NaN : Number(body.longitude);

    if (!title) errors.push('title es obligatorio.');
    else if (title.length > 150) errors.push('title no puede superar 150 caracteres.');

    if (!category) errors.push('category es obligatorio.');
    if (!description) errors.push('description es obligatorio.');
    else if (description.length < 10) errors.push('description debe tener al menos 10 caracteres.');

    if (!sector) errors.push('sector es obligatorio.');
    else if (sector.length > 100) errors.push('sector no puede superar 100 caracteres.');

    if (body.latitude == null || !Number.isFinite(latitude) || latitude < -90 || latitude > 90) {
      errors.push('latitude es obligatorio y debe ser un número entre -90 y 90.');
    }
    if (body.longitude == null || !Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
      errors.push('longitude es obligatorio y debe ser un número entre -180 y 180.');
    }

    // Campos opcionales
    let photo_url = null;
    if (body.photo_url != null && body.photo_url !== '') {
      photo_url = cleanString(body.photo_url);
      if (!photo_url) errors.push('photo_url debe ser un texto.');
    }

    let incident_date = null;
    if (body.incident_date != null && body.incident_date !== '') {
      const valid = typeof body.incident_date === 'string'
        && /^\d{4}-\d{2}-\d{2}$/.test(body.incident_date)
        && !Number.isNaN(Date.parse(body.incident_date));
      if (valid) incident_date = body.incident_date;
      else errors.push('incident_date debe tener formato YYYY-MM-DD.');
    }

    if (errors.length > 0) throw new HttpError(400, 'Datos inválidos.', errors);

    const report = await reportsService.createReport({
      title, category, description, sector, latitude, longitude, photo_url, incident_date,
    });

    res.status(201).json({ message: 'Reporte creado correctamente.', report });
  } catch (err) {
    next(err);
  }
}

// GET /api/reports
async function listReports(req, res, next) {
  try {
    const { category, status, sector, search } = req.query;

    // Paginación: page >= 1, limit entre 1 y 100 (por defecto 1 y 20)
    const page = req.query.page === undefined ? 1 : Number(req.query.page);
    const limit = req.query.limit === undefined ? 20 : Number(req.query.limit);
    if (!Number.isInteger(page) || page < 1) throw new HttpError(400, 'page debe ser un entero mayor o igual a 1.');
    if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
      throw new HttpError(400, 'limit debe ser un entero entre 1 y 100.');
    }

    // Normaliza y valida el estado
    let normalizedStatus;
    if (status) {
      normalizedStatus = String(status).toUpperCase();
      if (!VALID_STATUSES.includes(normalizedStatus)) {
        throw new HttpError(400, `status inválido. Valores permitidos: ${VALID_STATUSES.join(', ')}.`);
      }
    }

    const result = await reportsService.listReports({
      category: category ? String(category) : undefined,
      status: normalizedStatus,
      sector: sector ? String(sector) : undefined,
      search: search ? String(search).trim() : undefined,
      page,
      limit,
    });

    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

// GET /api/reports/:id  (id UUID o report_code)
async function getReport(req, res, next) {
  try {
    const identifier = String(req.params.id || '').trim();
    if (!identifier) throw new HttpError(400, 'Debes indicar un id o código de reporte.');

    const report = await reportsService.getReportByIdOrCode(identifier);
    if (!report) throw new HttpError(404, 'Reporte no encontrado.');

    res.status(200).json(report);
  } catch (err) {
    next(err);
  }
}

module.exports = { createReport, listReports, getReport };
