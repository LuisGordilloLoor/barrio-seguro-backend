// Lógica de negocio y consultas SQL de reportes.
const crypto = require('crypto');
const pool = require('../db/pool');
const HttpError = require('../utils/httpError');

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // sin caracteres confusos (0/O, 1/I)

// Genera un código con formato BS-XXXXXX
function generateReportCode() {
  let suffix = '';
  for (let i = 0; i < 6; i++) {
    suffix += CODE_CHARS[crypto.randomInt(CODE_CHARS.length)];
  }
  return `BS-${suffix}`;
}

// Columnas públicas (is_hidden no se expone)
const PUBLIC_COLUMNS = `
  id, report_code, title, category, description, sector,
  latitude, longitude, photo_url, incident_date, status, created_at, updated_at
`;

// Crea un reporte y su primer registro de historial (en una transacción)
async function createReport(data) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // La categoría debe existir en la tabla categories
    const cat = await client.query('SELECT 1 FROM categories WHERE name = $1', [data.category]);
    if (cat.rowCount === 0) {
      throw new HttpError(400, 'La categoría indicada no existe.');
    }

    // Reintenta si el código generado ya existe (muy poco probable)
    let report = null;
    for (let attempt = 0; attempt < 5 && !report; attempt++) {
      try {
        const result = await client.query(
          `INSERT INTO reports
             (report_code, title, category, description, sector, latitude, longitude, photo_url, incident_date, status)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'RECIBIDO')
           RETURNING ${PUBLIC_COLUMNS}`,
          [
            generateReportCode(), data.title, data.category, data.description, data.sector,
            data.latitude, data.longitude, data.photo_url, data.incident_date,
          ]
        );
        report = result.rows[0];
      } catch (err) {
        if (err.code !== '23505') throw err; // 23505 = código duplicado
      }
    }
    if (!report) throw new HttpError(500, 'No se pudo generar un código único para el reporte.');

    // Estado inicial en el historial
    await client.query(
      `INSERT INTO report_status_history (report_id, status) VALUES ($1, 'RECIBIDO')`,
      [report.id]
    );

    await client.query('COMMIT');
    return report;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

// Lista reportes visibles con filtros opcionales y paginación
async function listReports({ category, status, sector, search, page, limit }) {
  const conditions = ['is_hidden = false'];
  const params = [];

  if (category) { params.push(category); conditions.push(`category = $${params.length}`); }
  if (status)   { params.push(status);   conditions.push(`status = $${params.length}`); }
  if (sector)   { params.push(sector);   conditions.push(`sector ILIKE $${params.length}`); }
  if (search) {
    params.push(`%${search}%`);
    conditions.push(`(title ILIKE $${params.length} OR sector ILIKE $${params.length})`);
  }

  const where = `WHERE ${conditions.join(' AND ')}`;

  const countResult = await pool.query(`SELECT COUNT(*)::int AS total FROM reports ${where}`, params);

  const offset = (page - 1) * limit;
  const dataResult = await pool.query(
    `SELECT ${PUBLIC_COLUMNS}
       FROM reports ${where}
      ORDER BY created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, limit, offset]
  );

  return { total: countResult.rows[0].total, page, limit, reports: dataResult.rows };
}

// Obtiene un reporte por id (UUID) o por report_code, con su historial
async function getReportByIdOrCode(identifier) {
  const isUuid = UUID_REGEX.test(identifier);
  const result = await pool.query(
    `SELECT ${PUBLIC_COLUMNS} FROM reports
      WHERE ${isUuid ? 'id' : 'report_code'} = $1 AND is_hidden = false`,
    [isUuid ? identifier : identifier.toUpperCase()]
  );

  if (result.rowCount === 0) return null;
  const report = result.rows[0];

  const history = await pool.query(
    `SELECT status, changed_at FROM report_status_history
      WHERE report_id = $1 ORDER BY changed_at ASC, id ASC`,
    [report.id]
  );

  return { ...report, status_history: history.rows };
}

module.exports = { createReport, listReports, getReportByIdOrCode };
