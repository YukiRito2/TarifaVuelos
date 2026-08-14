const app = require("./app");
const config = require("./config");
const { pool } = require("./db");
const quotesService = require("./services/quotes.service");

async function start(){
  // Verifica la conexión a la base y de paso purga la papelera vencida
  // al arrancar (además del chequeo perezoso en GET /api/quotes/trash).
  await pool.query("SELECT 1");
  await quotesService.purgeExpired();

  app.listen(config.port, () => {
    console.log(`Celina API escuchando en el puerto ${config.port}`);
  });
}

start().catch(err => {
  console.error("No se pudo iniciar el servidor:", err);
  process.exit(1);
});
