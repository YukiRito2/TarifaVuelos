/**
 * Namespace global de la aplicación. Se evita usar ES modules para que
 * el sitio funcione abriendo el HTML directamente (file://), sin
 * servidor ni bundler.
 */
window.Celina = window.Celina || {};

Celina.config = {
  STORAGE_KEY: "celina_cotizaciones",
  TRASH_STORAGE_KEY: "celina_papelera",
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
