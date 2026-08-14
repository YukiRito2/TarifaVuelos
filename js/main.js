/**
 * Punto de entrada de la app. Debe cargarse al final, después de
 * config.js, utils.js, modal.js, api.js, auth.js, storage.js, preview.js,
 * focus-sync.js, form.js, history.js y export.js.
 */
window.Celina = window.Celina || {};

Celina.main = (function(){
  "use strict";

  /**
   * Ejecuta un bloque de arranque de forma aislada: si algo dentro
   * falla (ej. un archivo .js cacheado por el navegador y desactualizado,
   * o el backend caído), el error queda en consola pero NO impide que
   * el resto de los botones/filtros de la app se sigan conectando.
   * Admite tanto pasos síncronos como asíncronos (fn puede devolver
   * una promesa o no).
   */
  function safeRun(label, fn){
    return Promise.resolve()
      .then(fn)
      .catch(err => console.error(`Celina: fallo al iniciar "${label}"`, err));
  }

  /**
   * Trae las cotizaciones y el historial desde el backend. Se llama al
   * arrancar (si ya había una sesión activa) y también justo después
   * de un login exitoso.
   */
  async function loadAppData(){
    await safeRun("cargar cotizaciones", Celina.storage.loadQuotes);
    await safeRun("mostrar historial", Celina.history.renderHistory);
  }

  async function init(){
    await safeRun("logo embebido", () => {
      document.querySelectorAll(".js-celina-logo").forEach(img => {
        img.src = Celina.LOGO_DATA_URI;
      });
    });

    await safeRun("listeners del formulario", () => {
      document.getElementById("quoteForm").addEventListener("submit", Celina.form.handleFormSubmit);
      document.getElementById("btnCancelEdit").addEventListener("click", Celina.form.handleCancelEdit);
      document.getElementById("btnNewQuote").addEventListener("click", Celina.form.handleNewQuote);
      document.getElementById("f-solo-ida").addEventListener("change", Celina.form.handleSoloIdaToggle);

      // Vista previa en vivo: repinta la tarjeta con cada tecla/cambio,
      // antes de guardar.
      document.getElementById("quoteForm").addEventListener("input", Celina.form.updateLivePreview);
      document.getElementById("quoteForm").addEventListener("change", Celina.form.updateLivePreview);
    });

    await safeRun("resaltado de campo enfocado", Celina.focusSync.bind);

    await safeRun("menú hamburguesa", Celina.burgerMenu.bind);

    await safeRun("filtros del historial", () => {
      // La búsqueda es en tiempo real (input); el rango de fechas se
      // aplica al elegir cada fecha (change).
      document.getElementById("f-hist-search").addEventListener("input", Celina.history.renderHistory);
      document.getElementById("f-hist-desde").addEventListener("change", Celina.history.renderHistory);
      document.getElementById("f-hist-hasta").addEventListener("change", Celina.history.renderHistory);
      document.getElementById("btnClearFilters").addEventListener("click", Celina.history.handleClearFilters);
      document.getElementById("btnToggleTrash").addEventListener("click", Celina.history.handleToggleTrash);
    });

    await safeRun("botones de exportación", () => {
      document.getElementById("btnWhatsapp").addEventListener("click", Celina.exportActions.handleCopyWhatsapp);
      document.getElementById("btnPdf").addEventListener("click", Celina.exportActions.handleDownloadPdf);
      document.getElementById("btnPng").addEventListener("click", Celina.exportActions.handleSavePng);
    });

    // El login se conecta al final: si ya había una sesión activa
    // (token guardado de una recarga de página), dispara la carga de
    // datos de una vez. Si no, se queda mostrando la pantalla de login
    // y los datos se cargan recién tras un login exitoso
    // (ver js/auth.js -> Celina.main.loadAppData()).
    await safeRun("login", Celina.auth.bind);

    if(Celina.auth.isLoggedIn()){
      await loadAppData();
    }
  }

  document.addEventListener("DOMContentLoaded", () => { init(); });

  return { loadAppData };
})();
