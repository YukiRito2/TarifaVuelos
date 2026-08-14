window.Celina = window.Celina || {};

Celina.storage = (function(){
  const KEY = Celina.config.STORAGE_KEY;
  const TRASH_KEY = Celina.config.TRASH_STORAGE_KEY;
  const RETENTION_MS = Celina.config.TRASH_RETENTION_DAYS * 24 * 60 * 60 * 1000;

  function loadQuotes(){
    try{
      const raw = localStorage.getItem(KEY);
      Celina.state.quotes = raw ? JSON.parse(raw) : [];
    }catch(err){
      Celina.state.quotes = [];
    }
  }

  function persistQuotes(){
    localStorage.setItem(KEY, JSON.stringify(Celina.state.quotes));
  }

  function loadTrash(){
    try{
      const raw = localStorage.getItem(TRASH_KEY);
      Celina.state.trash = raw ? JSON.parse(raw) : [];
    }catch(err){
      Celina.state.trash = [];
    }
  }

  function persistTrash(){
    localStorage.setItem(TRASH_KEY, JSON.stringify(Celina.state.trash));
  }

  /**
   * Elimina definitivamente (ya no se puede restaurar) las
   * cotizaciones que llevan más de TRASH_RETENTION_DAYS días en la
   * papelera. Se llama al iniciar la app.
   */
  function purgeExpiredTrash(){
    const now = Date.now();
    const before = Celina.state.trash.length;

    Celina.state.trash = Celina.state.trash.filter(q => {
      const deletedAt = new Date(q.deletedAt).getTime();
      return isNaN(deletedAt) || (now - deletedAt) < RETENTION_MS;
    });

    if(Celina.state.trash.length !== before){
      persistTrash();
    }
  }

  return { loadQuotes, persistQuotes, loadTrash, persistTrash, purgeExpiredTrash };
})();
