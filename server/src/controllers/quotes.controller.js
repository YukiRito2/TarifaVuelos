const quotesService = require("../services/quotes.service");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");

const EQUIPAJE_VALUES = ["Mochila", "Cabina", "Maleta"];

// Convierte una fila de la base (snake_case) a la forma que ya espera
// el frontend (camelCase), la misma que usaba con localStorage.
function toApiShape(row){
  return {
    id: row.id,
    cliente: row.cliente,
    telefono: row.telefono,
    origen: row.origen,
    destino: row.destino,
    fechaIda: row.fecha_ida,
    fechaVuelta: row.fecha_vuelta || "",
    pasajeros: row.pasajeros,
    equipaje: row.equipaje,
    tarifaBase: row.tarifa_base,
    tasas: row.tasas,
    total: row.total,
    notas: row.notas,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at
  };
}

// Valida y normaliza el body de POST/PUT. El total NUNCA se toma del
// cliente — siempre se recalcula en el service, server-side.
function parseQuoteInput(body){
  const errors = [];

  const cliente = String(body.cliente || "").trim();
  const telefono = String(body.telefono || "").trim();
  const origen = String(body.origen || "").trim().toUpperCase();
  const destino = String(body.destino || "").trim().toUpperCase();
  const fechaIda = String(body.fechaIda || "").trim();
  const fechaVuelta = String(body.fechaVuelta || "").trim();
  const equipaje = String(body.equipaje || "").trim();
  const notas = String(body.notas || "").trim() || "Sin notas adicionales.";

  if(!cliente) errors.push("cliente es obligatorio");
  if(!telefono) errors.push("telefono es obligatorio");
  if(!origen) errors.push("origen es obligatorio");
  if(!destino) errors.push("destino es obligatorio");
  if(!fechaIda) errors.push("fechaIda es obligatoria");
  if(!EQUIPAJE_VALUES.includes(equipaje)) errors.push("equipaje inválido");

  const tarifaBase = Number(body.tarifaBase);
  const tasas = Number(body.tasas);
  if(!Number.isFinite(tarifaBase) || tarifaBase < 0) errors.push("tarifaBase inválida");
  if(!Number.isFinite(tasas) || tasas < 0) errors.push("tasas inválida");

  const p = body.pasajeros || {};
  const pasajeros = {
    adultos: Math.max(1, Number(p.adultos) || 1),
    ninos: Math.max(0, Number(p.ninos) || 0),
    bebes: Math.max(0, Number(p.bebes) || 0)
  };

  if(errors.length > 0){
    throw new ApiError(400, errors.join(", "));
  }

  return { cliente, telefono, origen, destino, fechaIda, fechaVuelta, equipaje, notas, tarifaBase, tasas, pasajeros };
}

const list = asyncHandler(async (req, res) => {
  const rows = await quotesService.listActive();
  res.json(rows.map(toApiShape));
});

const create = asyncHandler(async (req, res) => {
  const data = parseQuoteInput(req.body);
  const row = await quotesService.create(data);
  res.status(201).json(toApiShape(row));
});

const update = asyncHandler(async (req, res) => {
  const data = parseQuoteInput(req.body);
  const row = await quotesService.update(req.params.id, data);
  res.json(toApiShape(row));
});

const softDelete = asyncHandler(async (req, res) => {
  const row = await quotesService.softDelete(req.params.id);
  res.json(toApiShape(row));
});

const listTrash = asyncHandler(async (req, res) => {
  const rows = await quotesService.listTrash();
  res.json(rows.map(toApiShape));
});

const restore = asyncHandler(async (req, res) => {
  const row = await quotesService.restore(req.params.id);
  res.json(toApiShape(row));
});

const permanentDelete = asyncHandler(async (req, res) => {
  await quotesService.permanentDelete(req.params.id);
  res.status(204).send();
});

module.exports = { list, create, update, softDelete, listTrash, restore, permanentDelete };
