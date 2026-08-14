window.Celina = window.Celina || {};

/**
 * Modal de confirmación genérico, centrado en pantalla. Sustituye al
 * confirm() nativo del navegador para las acciones que queremos que
 * respeten la estética pastel de la app.
 */
Celina.modal = (function(){
  function confirm(message){
    return new Promise(resolve => {
      const overlay = document.getElementById("confirmModal");
      const btnOk = document.getElementById("confirmModalOk");
      const btnCancel = document.getElementById("confirmModalCancel");

      document.getElementById("confirmModalMessage").textContent = message;

      function close(result){
        overlay.classList.remove("show");
        btnOk.removeEventListener("click", onOk);
        btnCancel.removeEventListener("click", onCancel);
        overlay.removeEventListener("click", onOverlayClick);
        document.removeEventListener("keydown", onKeydown);
        resolve(result);
      }

      function onOk(){ close(true); }
      function onCancel(){ close(false); }
      function onOverlayClick(evt){ if(evt.target === overlay) close(false); }
      function onKeydown(evt){ if(evt.key === "Escape") close(false); }

      btnOk.addEventListener("click", onOk);
      btnCancel.addEventListener("click", onCancel);
      overlay.addEventListener("click", onOverlayClick);
      document.addEventListener("keydown", onKeydown);

      overlay.classList.add("show");
      btnOk.focus();
    });
  }

  return { confirm };
})();
