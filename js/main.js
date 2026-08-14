/**
 * Punto de entrada de la app. Debe cargarse al final, después de
 * config.js, utils.js, modal.js, auth.js, storage.js, preview.js,
 * focus-sync.js, form.js, history.js y export.js.
 */
(function(){
  "use strict";

  /**
   * Ejecuta un bloque de arranque de forma aislada: si algo dentro
   * falla (ej. un archivo .js cacheado por el navegador y desactualizado),
   * el error queda en consola pero NO impide que el resto de los
   * botones/filtros de la app se sigan conectando.
   */
  function safeRun(label, fn){
    try{
      fn();
    }catch(err){
      console.error(`Celina: fallo al iniciar "${label}"`, err);
    }
  }

  function init(){
    safeRun("logo embebido", () => {
      document.querySelectorAll(".js-celina-logo").forEach(img => {
        img.src = Celina.LOGO_DATA_URI;
      });
    });

    safeRun("login", Celina.auth.bind);

    safeRun("cargar datos guardados", () => {
      Celina.storage.loadQuotes();
      Celina.storage.loadTrash();
      Celina.storage.purgeExpiredTrash();
    });

    safeRun("mostrar historial inicial", Celina.history.renderHistory);

    safeRun("listeners del formulario", () => {
      document.getElementById("quoteForm").addEventListener("submit", Celina.form.handleFormSubmit);
      document.getElementById("btnCancelEdit").addEventListener("click", Celina.form.handleCancelEdit);
      document.getElementById("btnNewQuote").addEventListener("click", Celina.form.handleNewQuote);
      document.getElementById("f-solo-ida").addEventListener("change", Celina.form.handleSoloIdaToggle);

      // Vista previa en vivo: repinta la tarjeta con cada tecla/cambio,
      // antes de guardar.
      document.getElementById("quoteForm").addEventListener("input", Celina.form.updateLivePreview);
      document.getElementById("quoteForm").addEventListener("change", Celina.form.updateLivePreview);
    });

    safeRun("resaltado de campo enfocado", Celina.focusSync.bind);

    safeRun("filtros del historial", () => {
      // La búsqueda es en tiempo real (input); el rango de fechas se
      // aplica al elegir cada fecha (change).
      document.getElementById("f-hist-search").addEventListener("input", Celina.history.renderHistory);
      document.getElementById("f-hist-desde").addEventListener("change", Celina.history.renderHistory);
      document.getElementById("f-hist-hasta").addEventListener("change", Celina.history.renderHistory);
      document.getElementById("btnClearFilters").addEventListener("click", Celina.history.handleClearFilters);
      document.getElementById("btnToggleTrash").addEventListener("click", Celina.history.handleToggleTrash);
    });

    safeRun("botones de exportación", () => {
      document.getElementById("btnWhatsapp").addEventListener("click", Celina.exportActions.handleCopyWhatsapp);
      document.getElementById("btnPdf").addEventListener("click", Celina.exportActions.handleDownloadPdf);
      document.getElementById("btnPng").addEventListener("click", Celina.exportActions.handleSavePng);
    });

    // La tarjeta empieza vacía a propósito: como el formulario también
    // arranca vacío, mostrar aquí la última cotización guardada daba
    // la sensación de que "la tarjeta tiene datos que no están en las
    // casillas". Para ver una cotización anterior, se elige desde el
    // historial (✏️ Ver y Editar).
  }

  document.addEventListener("DOMContentLoaded", init);
})();
