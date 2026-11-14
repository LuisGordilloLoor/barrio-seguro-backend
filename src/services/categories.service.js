// Consultas de categorías.
const pool = require('../db/pool');

async function listCategories() {
  const result = await pool.query('SELECT id, name, description FROM categories ORDER BY id');
  return result.rows;
}

module.exports = { listCategories };
