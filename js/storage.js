window.Celina = window.Celina || {};

/**
 * Carga las cotizaciones desde el backend (server/). Ya no hay
 * localStorage ni "guardado" propio acá: cada creación/edición/borrado
 * se persiste sola en el momento a través de js/api.js, así que este
 * módulo solo se encarga de traer el estado inicial.
 */
Celina.storage = (function(){
  async function loadQuotes(){
    Celina.state.quotes = await Celina.api.listQuotes();
  }

  async function loadTrash(){
    Celina.state.trash = await Celina.api.listTrash();
  }

  return { loadQuotes, loadTrash };
})();
