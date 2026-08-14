# Celina Cotizador — API

Backend de Node.js + Express + PostgreSQL para que varios agentes vean y editen las mismas cotizaciones desde cualquier lugar (reemplaza el `localStorage` que usaba cada navegador por separado).

## 1. Requisitos

- Node.js instalado (https://nodejs.org, versión LTS).
- Una base de datos PostgreSQL a la que conectarse — puede ser local (ej. con Docker) o directamente la de Render (ver más abajo).

## 2. Configuración local

1. Copiá `.env.example` a `.env` y completá los valores.
2. Generá el hash de la contraseña compartida (nunca se guarda en texto plano):
   ```
   npm install
   npm run hash-password -- "la-contraseña-real"
   ```
   Copiá el resultado en `AUTH_PASSWORD_HASH` dentro de `.env`.
3. Generá un `JWT_SECRET` aleatorio:
   ```
   node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
   ```
4. Aplicá el esquema de la base de datos (crea la tabla `quotes`; es seguro correrlo varias veces):
   ```
   npm run db:apply
   ```
5. Arrancá el servidor:
   ```
   npm run dev
   ```
6. Probá que responde: abrí `http://localhost:3000/api/health` en el navegador — debería mostrar `{"status":"ok"}`.

## 3. Desplegar en Render

1. Subí este proyecto a un repositorio de GitHub (necesitás tu propia cuenta de GitHub).
2. En [render.com](https://render.com) (necesitás tu propia cuenta):
   - **New → PostgreSQL**: creá la base de datos. Copiá la **Internal Database URL**.
   - **New → Web Service**: conectá el repositorio de GitHub.
     - Root Directory: `server`
     - Build Command: `npm install`
     - Start Command: `npm start`
     - Pre-Deploy Command: `node scripts/apply-schema.js` (así el esquema se aplica solo en cada deploy).
3. En la pestaña **Environment** del servicio, configurá estas variables (no configures `PORT`, Render la define sola):
   - `DATABASE_URL` → la Internal Database URL del paso anterior.
   - `AUTH_USERNAME` → el usuario compartido, ej. `celina`.
   - `AUTH_PASSWORD_HASH` → el hash generado en el paso 2 (nunca la contraseña real).
   - `JWT_SECRET` → el valor generado en el paso 3 de la sección anterior.
   - `JWT_EXPIRES_IN` → `12h` (o el valor que prefieras).
   - `FRONTEND_ORIGIN` → la URL donde vas a alojar `index.html` (ej. `https://celina-cotizador.onrender.com`). Si necesitás más de un origen, separalos por coma.
4. Deploy. Probá `https://tu-servicio.onrender.com/api/health`.
5. Actualizá `Celina.config.API_BASE_URL` en el frontend (`js/config.js`) con esta URL real, y volvé a publicar el sitio estático.

## 4. Qué hace cada carpeta

- `src/routes` → qué URL responde qué.
- `src/controllers` → valida la entrada y da forma a la respuesta (convierte entre el formato de la base y el que espera el frontend).
- `src/services` → las consultas SQL reales.
- `src/middleware/auth.js` → exige el token de sesión en todas las rutas de `/api/quotes`.
- `db/schema.sql` → la única tabla de la base (`quotes`), con `deleted_at` marcando si está en la papelera.
- `scripts/` → utilidades de línea de comandos (aplicar el esquema, generar el hash de la contraseña).
