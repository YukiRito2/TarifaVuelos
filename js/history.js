window.Celina = window.Celina || {};

Celina.history = (function(){
  const { formatMoney, formatDate, formatDateTime, showToast } = Celina.utils;

  let showingTrash = false;

  function getFilteredQuotes(){
    const search = document.getElementById("f-hist-search").value.trim().toLowerCase();
    const desde = document.getElementById("f-hist-desde").value;
    const hasta = document.getElementById("f-hist-hasta").value;

    return Celina.state.quotes.filter(q => {
      if(search){
        const haystack = `${q.cliente} ${q.origen} ${q.destino}`.toLowerCase();
        if(!haystack.includes(search)) return false;
      }
      if(desde && q.fechaIda && q.fechaIda < desde) return false;
      if(hasta && q.fechaIda && q.fechaIda > hasta) return false;
      return true;
    });
  }

  function daysLeft(deletedAt){
    const retentionMs = Celina.config.TRASH_RETENTION_DAYS * 24 * 60 * 60 * 1000;
    const elapsed = Date.now() - new Date(deletedAt).getTime();
    return Math.max(0, Math.ceil((retentionMs - elapsed) / (24 * 60 * 60 * 1000)));
  }

  function updateTrashButton(){
    const btn = document.getElementById("btnToggleTrash");
    if(!btn) return;
    const count = Celina.state.trash.length;
    btn.textContent = showingTrash
      ? "← Volver al historial"
      : `🗑️ Papelera${count > 0 ? ` (${count})` : ""}`;
  }

  function renderHistory(){
    const list = document.getElementById("historyList");
    const filtersEl = document.getElementById("historyFilters");

    updateTrashButton();

    if(showingTrash){
      if(filtersEl) filtersEl.style.display = "none";
      renderTrash(list);
      return;
    }

    if(filtersEl) filtersEl.style.display = "";

    const quotes = Celina.state.quotes;

    if(quotes.length === 0){
      list.innerHTML = '<div class="history-empty">No hay cotizaciones guardadas aún.</div>';
      return;
    }

    const filtered = getFilteredQuotes();

    if(filtered.length === 0){
      list.innerHTML = '<div class="history-empty">🔍 No se encontraron cotizaciones con esos filtros.</div>';
      return;
    }

    list.innerHTML = filtered.map(q => `
      <div class="history-item" data-id="${q.id}">
        <div class="history-info">
          <span class="history-client">👤 ${q.cliente}</span>
          <span class="history-route">${q.origen} ➔ ${q.destino}</span>
          <span class="history-meta">🛫 Vuelo: ${formatDate(q.fechaIda)} &nbsp;·&nbsp; 🕐 Creada: ${formatDateTime(q.createdAt)}</span>
          <span class="history-total">${formatMoney(q.total)}</span>
        </div>
        <div class="history-buttons">
          <button class="btn btn-edit" data-action="edit" data-id="${q.id}">✏️ Ver y Editar</button>
          <button class="btn btn-danger" data-action="delete" data-id="${q.id}">🗑️ Eliminar</button>
        </div>
      </div>
    `).join("");

    list.querySelectorAll('[data-action="edit"]').forEach(btn => {
      btn.addEventListener("click", () => handleEditQuote(btn.dataset.id));
    });
    list.querySelectorAll('[data-action="delete"]').forEach(btn => {
      btn.addEventListener("click", () => handleDeleteQuote(btn.dataset.id));
    });
  }

  function renderTrash(list){
    const trash = Celina.state.trash;

    if(trash.length === 0){
      list.innerHTML = '<div class="history-empty">La papelera está vacía.</div>';
      return;
    }

    const sorted = trash.slice().sort((a, b) => new Date(b.deletedAt) - new Date(a.deletedAt));

    list.innerHTML = sorted.map(q => `
      <div class="history-item history-item-trash" data-id="${q.id}">
        <div class="history-info">
          <span class="history-client">👤 ${q.cliente}</span>
          <span class="history-route">${q.origen} ➔ ${q.destino}</span>
          <span class="history-meta">🗑️ Eliminada: ${formatDateTime(q.deletedAt)} &nbsp;·&nbsp; ⏳ Se borra en ${daysLeft(q.deletedAt)} día(s)</span>
          <span class="history-total">${formatMoney(q.total)}</span>
        </div>
        <div class="history-buttons">
          <button class="btn btn-edit" data-action="restore" data-id="${q.id}">♻️ Restaurar</button>
          <button class="btn btn-danger" data-action="purge" data-id="${q.id}">❌ Eliminar definitivo</button>
        </div>
      </div>
    `).join("");

    list.querySelectorAll('[data-action="restore"]').forEach(btn => {
      btn.addEventListener("click", () => handleRestoreQuote(btn.dataset.id));
    });
    list.querySelectorAll('[data-action="purge"]').forEach(btn => {
      btn.addEventListener("click", () => handlePermanentDelete(btn.dataset.id));
    });
  }

  /**
   * Seleccionar una cotización del historial la carga en la tarjeta de
   * vista previa Y deja el formulario listo en modo edición, en el
   * mismo paso — ya no hace falta un botón "Ver" separado de "Editar".
   */
  function handleEditQuote(id){
    const quote = Celina.state.quotes.find(q => q.id === id);
    if(!quote) return;
    Celina.preview.setCurrentQuote(quote);
    Celina.form.enterEditMode(quote);
  }

  async function handleDeleteQuote(id){
    const confirmed = await Celina.modal.confirm("¿Mover esta cotización a la papelera? Se eliminará definitivamente en 30 días.");
    if(!confirmed) return;

    const idx = Celina.state.quotes.findIndex(q => q.id === id);
    if(idx === -1) return;

    const [quote] = Celina.state.quotes.splice(idx, 1);
    quote.deletedAt = new Date().toISOString();
    Celina.state.trash.unshift(quote);

    Celina.storage.persistQuotes();
    Celina.storage.persistTrash();
    renderHistory();

    const { currentQuote, editingId } = Celina.state;

    if(currentQuote && currentQuote.id === id){
      Celina.preview.clearPreview();
    }

    if(editingId === id){
      Celina.form.exitEditMode();
    }

    showToast("🗑️ Movida a la papelera");
  }

  function handleRestoreQuote(id){
    const idx = Celina.state.trash.findIndex(q => q.id === id);
    if(idx === -1) return;

    const [quote] = Celina.state.trash.splice(idx, 1);
    delete quote.deletedAt;
    Celina.state.quotes.unshift(quote);

    Celina.storage.persistQuotes();
    Celina.storage.persistTrash();
    renderHistory();

    showToast("♻️ Cotización restaurada al historial");
  }

  async function handlePermanentDelete(id){
    const confirmed = await Celina.modal.confirm("¿Eliminar esta cotización definitivamente? Esta acción no se puede deshacer.");
    if(!confirmed) return;

    Celina.state.trash = Celina.state.trash.filter(q => q.id !== id);
    Celina.storage.persistTrash();
    renderHistory();

    showToast("🗑️ Cotización eliminada definitivamente");
  }

  function handleToggleTrash(){
    showingTrash = !showingTrash;
    renderHistory();
  }

  function handleClearFilters(){
    document.getElementById("f-hist-search").value = "";
    document.getElementById("f-hist-desde").value = "";
    document.getElementById("f-hist-hasta").value = "";
    renderHistory();
  }

  return {
    renderHistory, handleEditQuote, handleDeleteQuote,
    handleRestoreQuote, handlePermanentDelete, handleToggleTrash, handleClearFilters
  };
})();
