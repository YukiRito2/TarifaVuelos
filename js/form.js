window.Celina = window.Celina || {};

Celina.form = (function(){
  const { showToast } = Celina.utils;

  // Campos obligatorios del formulario -> bloque(s) que deben verse
  // "vacíos" (tenues) en la tarjeta mientras no se hayan rellenado.
  const REQUIRED_FIELD_TARGETS = {
    "f-cliente": ["pv-cliente"],
    "f-telefono": ["pv-telefono-box"],
    "f-origen": ["pv-origen-box"],
    "f-destino": ["pv-destino-box"],
    "f-fecha-ida": ["pv-ida-box"],
    "f-tarifa": ["pv-tarifa-box", "pv-total-box"],
    "f-tasas": ["pv-tasas-box", "pv-total-box"]
  };

  function readFormValues(){
    const soloIda = document.getElementById("f-solo-ida").checked;
    return {
      cliente: document.getElementById("f-cliente").value.trim(),
      telefono: document.getElementById("f-telefono").value.trim(),
      origen: document.getElementById("f-origen").value.trim().toUpperCase(),
      destino: document.getElementById("f-destino").value.trim().toUpperCase(),
      fechaIda: document.getElementById("f-fecha-ida").value,
      fechaVuelta: soloIda ? "" : document.getElementById("f-fecha-vuelta").value,
      pasajeros: {
        adultos: Math.max(1, Number(document.getElementById("f-adultos").value) || 1),
        ninos: Math.max(0, Number(document.getElementById("f-ninos").value) || 0),
        bebes: Math.max(0, Number(document.getElementById("f-bebes").value) || 0)
      },
      equipaje: document.getElementById("f-equipaje").value,
      tarifaBase: Number(document.getElementById("f-tarifa").value) || 0,
      tasas: Number(document.getElementById("f-tasas").value) || 0,
      notas: document.getElementById("f-notas").value.trim() || "Sin notas adicionales."
    };
  }

  function fillFormWithQuote(quote){
    document.getElementById("f-cliente").value = quote.cliente;
    document.getElementById("f-telefono").value = quote.telefono;
    document.getElementById("f-origen").value = quote.origen;
    document.getElementById("f-destino").value = quote.destino;
    document.getElementById("f-fecha-ida").value = quote.fechaIda;
    document.getElementById("f-fecha-vuelta").value = quote.fechaVuelta;
    document.getElementById("f-solo-ida").checked = !quote.fechaVuelta;
    document.getElementById("f-fecha-vuelta").disabled = !quote.fechaVuelta;
    const pasajeros = quote.pasajeros || { adultos: 1, ninos: 0, bebes: 0 };
    document.getElementById("f-adultos").value = pasajeros.adultos;
    document.getElementById("f-ninos").value = pasajeros.ninos;
    document.getElementById("f-bebes").value = pasajeros.bebes;
    document.getElementById("f-equipaje").value = quote.equipaje;
    document.getElementById("f-tarifa").value = quote.tarifaBase;
    document.getElementById("f-tasas").value = quote.tasas;
    document.getElementById("f-notas").value = quote.notas;
  }

  function handleSoloIdaToggle(){
    const checked = document.getElementById("f-solo-ida").checked;
    const vueltaInput = document.getElementById("f-fecha-vuelta");
    vueltaInput.disabled = checked;
    if(checked){ vueltaInput.value = ""; }
  }

  /**
   * Pinta lo que hay en el formulario en la tarjeta de la derecha a
   * medida que se escribe, antes de guardar. Si se está editando una
   * cotización existente, conserva su id para que los botones de
   * exportar sigan funcionando sobre ella mientras se edita.
   */
  function updateLivePreview(){
    const values = readFormValues();
    const total = values.tarifaBase + values.tasas;
    const draft = Object.assign({ id: Celina.state.editingId || "" }, values, { total });
    Celina.preview.setCurrentQuote(draft);
    updateCompletionState();
  }

  function clearEmptyState(){
    document.querySelectorAll(".pv-empty").forEach(el => el.classList.remove("pv-empty"));
  }

  /**
   * Marca con la clase .pv-empty los bloques de la tarjeta cuyo campo
   * obligatorio todavía no se llenó, para que se vean como una casilla
   * tenue mientras falta ese dato. La fecha de vuelta es un caso
   * aparte: solo cuenta como "falta" si el viaje no es de solo ida.
   */
  function updateCompletionState(){
    clearEmptyState();

    Object.keys(REQUIRED_FIELD_TARGETS).forEach(fieldId => {
      if(document.getElementById(fieldId).value.trim() !== "") return;
      REQUIRED_FIELD_TARGETS[fieldId].forEach(targetId => {
        const el = document.getElementById(targetId);
        if(el) el.classList.add("pv-empty");
      });
    });

    const soloIda = document.getElementById("f-solo-ida").checked;
    const fechaVuelta = document.getElementById("f-fecha-vuelta").value;
    if(!soloIda && fechaVuelta.trim() === ""){
      const el = document.getElementById("pv-vuelta-box");
      if(el) el.classList.add("pv-empty");
    }
  }

  function exitEditMode(){
    Celina.state.editingId = null;
    document.getElementById("formTitle").textContent = "📝 Nueva cotización";
    document.getElementById("btnSubmitForm").textContent = "💾 Calcular y Guardar Cotización";
    document.getElementById("btnCancelEdit").style.display = "none";
    document.getElementById("quoteForm").reset();
    document.getElementById("f-equipaje").value = "Maleta";
    document.getElementById("f-fecha-vuelta").disabled = false;
  }

  function setEditingUiState(){
    document.getElementById("formTitle").textContent = "✏️ Editar cotización";
    document.getElementById("btnSubmitForm").textContent = "💾 Actualizar Cotización";
    document.getElementById("btnCancelEdit").style.display = "block";
  }

  function enterEditMode(quote){
    Celina.state.editingId = quote.id;
    fillFormWithQuote(quote);
    updateCompletionState();
    setEditingUiState();

    document.getElementById("panel-form").scrollIntoView({ behavior: "smooth", block: "start" });
    showToast("✏️ Editando cotización — modifica los campos y guarda");
  }

  async function handleFormSubmit(evt){
    evt.preventDefault();

    const values = readFormValues();
    const editingId = Celina.state.editingId;
    const submitBtn = document.getElementById("btnSubmitForm");
    const originalBtnText = submitBtn.textContent;

    let quote;

    if(editingId){
      const confirmed = await Celina.modal.confirm("¿Estás seguro de guardar cambios?");
      if(!confirmed) return;

      submitBtn.disabled = true;
      submitBtn.textContent = "⏳ Guardando...";
      try{
        quote = await Celina.api.updateQuote(editingId, values);
      }catch(err){
        showToast("⚠️ " + err.message);
        return;
      }finally{
        submitBtn.disabled = false;
        submitBtn.textContent = originalBtnText;
      }

      const idx = Celina.state.quotes.findIndex(q => q.id === editingId);
      if(idx !== -1){ Celina.state.quotes[idx] = quote; }
      else{ Celina.state.quotes.unshift(quote); }
      showToast("✅ Cotización actualizada");
    }else{
      submitBtn.disabled = true;
      submitBtn.textContent = "⏳ Guardando...";
      try{
        quote = await Celina.api.createQuote(values);
      }catch(err){
        showToast("⚠️ " + err.message);
        return;
      }finally{
        submitBtn.disabled = false;
        submitBtn.textContent = originalBtnText;
      }

      Celina.state.quotes.unshift(quote);
      showToast("✅ Cotización calculada y guardada");
    }

    Celina.history.renderHistory();

    // El formulario y la tarjeta se quedan mostrando lo que se acaba de
    // guardar/actualizar (no se vacían solos). Además queda "enganchado"
    // a esa cotización: si seguís retocando campos y volvés a guardar,
    // actualiza esta misma en vez de crear una duplicada. Para empezar
    // una cotización nueva, está el botón "✨ Nueva Cotización".
    Celina.state.editingId = quote.id;
    setEditingUiState();
    Celina.preview.setCurrentQuote(quote);
    clearEmptyState();
  }

  function handleCancelEdit(){
    exitEditMode();

    // El formulario vuelve a quedar vacío, así que la tarjeta también
    // se vacía para que ambos lados sigan mostrando lo mismo.
    Celina.preview.clearPreview();
    clearEmptyState();

    showToast("✖️ Edición cancelada");
  }

  /**
   * Vacía el formulario y la tarjeta para empezar una cotización desde
   * cero, sin importar si había una edición en curso.
   */
  function handleNewQuote(){
    exitEditMode();
    Celina.preview.clearPreview();
    clearEmptyState();

    document.getElementById("panel-form").scrollIntoView({ behavior: "smooth", block: "start" });
    document.getElementById("f-cliente").focus();
    showToast("📝 Listo para una nueva cotización");
  }

  return {
    readFormValues, fillFormWithQuote, exitEditMode, enterEditMode,
    handleFormSubmit, handleCancelEdit, handleSoloIdaToggle, updateLivePreview,
    handleNewQuote
  };
})();
