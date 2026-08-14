const { pool } = require("../db");
const config = require("../config");

/**
 * Devuelve la credencial compartida guardada en la base. Si la tabla
 * todavía está vacía (primer arranque del servidor), la siembra una
 * sola vez con AUTH_USERNAME/AUTH_PASSWORD_HASH del .env — de ahí en
 * adelante la base manda, y AUTH_USERNAME/AUTH_PASSWORD_HASH ya no se
 * vuelven a leer.
 */
async function getCredentials(){
  const { rows } = await pool.query("SELECT * FROM auth_credentials WHERE id = 1");

  if(rows.length > 0){
    return rows[0];
  }

  const { rows: inserted } = await pool.query(
    `INSERT INTO auth_credentials (id, username, password_hash)
     VALUES (1, $1, $2)
     ON CONFLICT (id) DO NOTHING
     RETURNING *`,
    [config.authUsername, config.authPasswordHash]
  );

  if(inserted.length > 0){
    return inserted[0];
  }

  // Otra request insertó la fila justo antes (condición de carrera
  // improbable pero posible en el primer arranque) — se relee.
  const { rows: retry } = await pool.query("SELECT * FROM auth_credentials WHERE id = 1");
  return retry[0];
}

async function updatePassword(newHash){
  await pool.query(
    "UPDATE auth_credentials SET password_hash = $1, updated_at = now() WHERE id = 1",
    [newHash]
  );
}

module.exports = { getCredentials, updatePassword };
