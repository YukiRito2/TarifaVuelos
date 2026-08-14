const { Pool, types } = require("pg");
const config = require("./config");

// node-postgres no convierte NUMERIC a number por defecto (para no perder
// precisión en silencio) — lo devuelve como string. Los montos de la
// cotización (tarifa_base, tasas, total) necesitan llegar al frontend
// como número, así que registramos el parser una sola vez, acá.
types.setTypeParser(1700 /* NUMERIC */, val => (val === null ? null : parseFloat(val)));

// DATE por defecto se parsea como Date en UTC medianoche, lo que puede
// mostrar el día anterior según la zona horaria del navegador al hacer
// JSON.stringify. El frontend solo necesita el string "YYYY-MM-DD" tal
// cual, para los <input type="date">, así que lo dejamos pasar crudo.
types.setTypeParser(1082 /* DATE */, val => val);

const pool = new Pool({
  connectionString: config.databaseUrl,
  ssl: config.databaseUrl.includes("localhost") ? false : { rejectUnauthorized: false }
});

module.exports = { pool };
