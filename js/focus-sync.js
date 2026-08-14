window.Celina = window.Celina || {};

/**
 * Resalta en la tarjeta de vista previa el bloque que corresponde al
 * campo del formulario que tiene el foco, para que quede claro qué
 * parte de la tarjeta se está rellenando en cada momento.
 */
Celina.focusSync = (function(){
  const HIGHLIGHT_CLASS = "pv-highlight";

  const FIELD_TO_PREVIEW = {
    "f-cliente": ["pv-cliente"],
    "f-telefono": ["pv-telefono-box"],
    "f-origen": ["pv-origen-box"],
    "f-destino": ["pv-destino-box"],
    "f-fecha-ida": ["pv-ida-box"],
    "f-fecha-vuelta": ["pv-vuelta-box"],
    "f-solo-ida": ["pv-vuelta-box"],
    "f-adultos": ["pv-pasajeros-box"],
    "f-ninos": ["pv-pasajeros-box"],
    "f-bebes": ["pv-pasajeros-box"],
    "f-equipaje": ["pv-equipaje-box"],
    "f-tarifa": ["pv-tarifa-box", "pv-total-box"],
    "f-tasas": ["pv-tasas-box", "pv-total-box"],
    "f-notas": ["pv-notas"]
  };

  function clearHighlights(){
    document.querySelectorAll("." + HIGHLIGHT_CLASS).forEach(el => {
      el.classList.remove(HIGHLIGHT_CLASS);
    });
  }

  function highlightFor(fieldId){
    clearHighlights();
    const targetIds = FIELD_TO_PREVIEW[fieldId];
    if(!targetIds) return;
    targetIds.forEach(id => {
      const el = document.getElementById(id);
      if(el) el.classList.add(HIGHLIGHT_CLASS);
    });
  }

  function bind(){
    const form = document.getElementById("quoteForm");
    form.addEventListener("focusin", evt => {
      if(evt.target && evt.target.id){ highlightFor(evt.target.id); }
    });
    form.addEventListener("focusout", clearHighlights);
  }

  return { bind };
})();
