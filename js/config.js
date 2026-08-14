/**
 * Namespace global de la aplicación. Se evita usar ES modules para que
 * el sitio funcione abriendo el HTML directamente (file://), sin
 * servidor ni bundler.
 */
window.Celina = window.Celina || {};

Celina.config = {
  // URL del backend (server/). En local apunta a tu servidor Node
  // corriendo en el puerto 3000; en producción, reemplazá el placeholder
  // por la URL real del servicio una vez desplegado en Render.
  API_BASE_URL: (["localhost", "127.0.0.1", ""].includes(location.hostname))
    ? "http://localhost:3000/api"
    : "https://TU-SERVICIO.onrender.com/api",
  // Solo para mostrar la cuenta regresiva en la papelera — el borrado
  // real a los 30 días lo hace el servidor, no el navegador.
  TRASH_RETENTION_DAYS: 30,
  MESES: ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"]
};

/**
 * Estado en memoria compartido entre módulos.
 */
Celina.state = {
  quotes: [],
  trash: [],
  currentQuote: null,
  editingId: null
};
