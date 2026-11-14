// Punto de entrada: carga variables de entorno y levanta el servidor.
require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Barrio Seguro API escuchando en http://localhost:${PORT}`);
});
