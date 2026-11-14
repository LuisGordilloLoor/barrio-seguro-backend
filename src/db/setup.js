// Script de "npm run db:setup": ejecuta schema.sql y luego seed.sql.
const fs = require('fs');
const path = require('path');
const pool = require('./pool');

async function runSqlFile(filename) {
  const sql = fs.readFileSync(path.join(__dirname, filename), 'utf8');
  await pool.query(sql);
  console.log(`✔ ${filename} ejecutado`);
}

(async () => {
  try {
    await runSqlFile('schema.sql');
    await runSqlFile('seed.sql');
    console.log('Base de datos lista.');
  } catch (err) {
    console.error('✖ Error configurando la base de datos:', err.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
})();
