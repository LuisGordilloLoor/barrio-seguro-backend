// Estadísticas agregadas (solo reportes visibles).
const pool = require('../db/pool');

async function getStats() {
  const [totalRes, statusRes, categoryRes, sectorsRes] = await Promise.all([
    pool.query('SELECT COUNT(*)::int AS total FROM reports WHERE is_hidden = false'),
    pool.query('SELECT status::text AS status, COUNT(*)::int AS total FROM reports WHERE is_hidden = false GROUP BY status'),
    // LEFT JOIN para incluir también categorías sin reportes (total = 0)
    pool.query(
      `SELECT c.name AS category, COUNT(r.id)::int AS total
         FROM categories c
         LEFT JOIN reports r ON r.category = c.name AND r.is_hidden = false
        GROUP BY c.id, c.name
        ORDER BY c.id`
    ),
    pool.query(
      `SELECT sector, COUNT(*)::int AS total
         FROM reports WHERE is_hidden = false
        GROUP BY sector
        ORDER BY total DESC, sector ASC
        LIMIT 5`
    ),
  ]);

  // Conteo por estado con los 4 estados siempre presentes
  const byStatus = { recibido: 0, en_revision: 0, en_atencion: 0, resuelto: 0 };
  statusRes.rows.forEach((row) => { byStatus[row.status.toLowerCase()] = row.total; });

  return {
    total_reports: totalRes.rows[0].total,
    by_status: byStatus,
    by_category: categoryRes.rows,
    top_sectors: sectorsRes.rows,
  };
}

module.exports = { getStats };
