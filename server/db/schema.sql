-- Esquema de la base de datos del cotizador de Celina.
-- Idempotente a propósito: se puede volver a correr en cada deploy sin romper nada.

CREATE TABLE IF NOT EXISTS quotes (
  id            UUID PRIMARY KEY,
  cliente       TEXT NOT NULL,
  telefono      TEXT NOT NULL,
  origen        VARCHAR(10) NOT NULL,
  destino       VARCHAR(10) NOT NULL,
  fecha_ida     DATE NOT NULL,
  fecha_vuelta  DATE NULL,
  pasajeros     JSONB NOT NULL DEFAULT '{"adultos":1,"ninos":0,"bebes":0}'::jsonb,
  equipaje      TEXT NOT NULL CHECK (equipaje IN ('Mochila','Cabina','Maleta')),
  tarifa_base   NUMERIC(10,2) NOT NULL,
  tasas         NUMERIC(10,2) NOT NULL,
  total         NUMERIC(10,2) NOT NULL,
  notas         TEXT NOT NULL DEFAULT '',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NULL,
  deleted_at    TIMESTAMPTZ NULL
);

CREATE INDEX IF NOT EXISTS idx_quotes_deleted_at ON quotes (deleted_at);
CREATE INDEX IF NOT EXISTS idx_quotes_created_at ON quotes (created_at DESC);

-- Credencial única compartida por todos los agentes. Fila única (id
-- siempre 1): así se puede cambiar la contraseña desde la app en
-- cualquier momento, sin tocar variables de entorno ni reiniciar el
-- servidor. Si la tabla está vacía, el servidor la siembra una vez con
-- AUTH_USERNAME/AUTH_PASSWORD_HASH del .env la primera vez que arranca.
CREATE TABLE IF NOT EXISTS auth_credentials (
  id             INTEGER PRIMARY KEY,
  username       TEXT NOT NULL,
  password_hash  TEXT NOT NULL,
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT auth_credentials_single_row CHECK (id = 1)
);
