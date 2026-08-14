const crypto = require("crypto");
const { pool } = require("../db");
const ApiError = require("../utils/ApiError");

const RETENTION_DAYS = 30;

async function listActive(){
  const { rows } = await pool.query(
    "SELECT * FROM quotes WHERE deleted_at IS NULL ORDER BY created_at DESC"
  );
  return rows;
}

async function create(data){
  const id = crypto.randomUUID();
  const total = data.tarifaBase + data.tasas;

  const { rows } = await pool.query(
    `INSERT INTO quotes
      (id, cliente, telefono, origen, destino, fecha_ida, fecha_vuelta, pasajeros, equipaje, tarifa_base, tasas, total, notas)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
     RETURNING *`,
    [
      id, data.cliente, data.telefono, data.origen, data.destino,
      data.fechaIda, data.fechaVuelta || null, JSON.stringify(data.pasajeros),
      data.equipaje, data.tarifaBase, data.tasas, total, data.notas
    ]
  );

  return rows[0];
}

async function update(id, data){
  const total = data.tarifaBase + data.tasas;

  const { rows } = await pool.query(
    `UPDATE quotes SET
       cliente = $1, telefono = $2, origen = $3, destino = $4,
       fecha_ida = $5, fecha_vuelta = $6, pasajeros = $7, equipaje = $8,
       tarifa_base = $9, tasas = $10, total = $11, notas = $12,
       updated_at = now()
     WHERE id = $13 AND deleted_at IS NULL
     RETURNING *`,
    [
      data.cliente, data.telefono, data.origen, data.destino,
      data.fechaIda, data.fechaVuelta || null, JSON.stringify(data.pasajeros),
      data.equipaje, data.tarifaBase, data.tasas, total, data.notas, id
    ]
  );

  if(rows.length === 0){
    throw new ApiError(404, "Cotización no encontrada");
  }
  return rows[0];
}

async function softDelete(id){
  const { rows } = await pool.query(
    "UPDATE quotes SET deleted_at = now() WHERE id = $1 AND deleted_at IS NULL RETURNING *",
    [id]
  );
  if(rows.length === 0){
    throw new ApiError(404, "Cotización no encontrada");
  }
  return rows[0];
}

async function purgeExpired(){
  await pool.query(
    `DELETE FROM quotes WHERE deleted_at IS NOT NULL AND deleted_at < now() - interval '${RETENTION_DAYS} days'`
  );
}

async function listTrash(){
  await purgeExpired();
  const { rows } = await pool.query(
    "SELECT * FROM quotes WHERE deleted_at IS NOT NULL ORDER BY deleted_at DESC"
  );
  return rows;
}

async function restore(id){
  const { rows } = await pool.query(
    "UPDATE quotes SET deleted_at = NULL WHERE id = $1 AND deleted_at IS NOT NULL RETURNING *",
    [id]
  );
  if(rows.length === 0){
    throw new ApiError(404, "Cotización no encontrada en la papelera");
  }
  return rows[0];
}

async function permanentDelete(id){
  const { rows } = await pool.query(
    "DELETE FROM quotes WHERE id = $1 AND deleted_at IS NOT NULL RETURNING id",
    [id]
  );
  if(rows.length === 0){
    throw new ApiError(404, "Cotización no encontrada en la papelera");
  }
}

module.exports = {
  listActive, create, update, softDelete,
  listTrash, restore, permanentDelete, purgeExpired
};
