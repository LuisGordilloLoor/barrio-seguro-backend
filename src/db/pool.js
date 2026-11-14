// Conexión a PostgreSQL mediante un pool de "pg", configurada con variables de entorno.
require('dotenv').config();
const { Pool, types } = require('pg');

// pg devuelve DECIMAL (1700) como texto; lo convertimos a número (latitud/longitud).
types.setTypeParser(1700, (value) => parseFloat(value));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Errores inesperados de clientes inactivos del pool
pool.on('error', (err) => {
  console.error('Error inesperado en el pool de PostgreSQL:', err.message);
});

module.exports = pool;
