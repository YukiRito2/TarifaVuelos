window.Celina = window.Celina || {};

/**
 * Barra lateral (menú hamburguesa), solo visible en la vista de
 * celular (ver CSS). No duplica lógica: los ítems simplemente hacen
 * clic programático sobre los botones reales del header ("Cambiar
 * contraseña" / "Cerrar sesión"), que ya tienen su comportamiento
 * conectado en js/auth.js.
 */
Celina.burgerMenu = (function(){
  function open(){
    document.getElementById("burgerMenu").classList.add("show");
    document.getElementById("burgerOverlay").classList.add("show");
    document.getElementById("btnBurgerMenu").classList.add("open");
  }

  function close(){
    document.getElementById("burgerMenu").classList.remove("show");
    document.getElementById("burgerOverlay").classList.remove("show");
    document.getElementById("btnBurgerMenu").classList.remove("open");
  }

  function toggle(){
    document.getElementById("burgerMenu").classList.contains("show") ? close() : open();
  }

  function goToHistory(){
    close();
    document.getElementById("panel-history").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function proxyClick(targetId){
    return function(){
      close();
      document.getElementById(targetId).click();
    };
  }

  function bind(){
    document.getElementById("btnBurgerMenu").addEventListener("click", toggle);
    document.getElementById("btnCloseBurger").addEventListener("click", close);
    document.getElementById("burgerOverlay").addEventListener("click", close);

    document.getElementById("burgerHistorial").addEventListener("click", goToHistory);
    document.getElementById("burgerChangePassword").addEventListener("click", proxyClick("btnChangePassword"));
    document.getElementById("burgerLogout").addEventListener("click", proxyClick("btnLogout"));
  }

  return { bind };
})();
