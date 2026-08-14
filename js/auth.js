window.Celina = window.Celina || {};

/**
 * Puerta de acceso simple para uso local/personal. Las credenciales
 * viven en este archivo (no hay backend), así que esto NO es
 * seguridad real — solo evita que alguien abra la app por accidente.
 * La sesión dura mientras el navegador siga abierto (sessionStorage).
 */
Celina.auth = (function(){
  const SESSION_KEY = "celina_session";
  const VALID_USER = "admin";
  const VALID_PASS = "admin";

  function isLoggedIn(){
    return sessionStorage.getItem(SESSION_KEY) === "1";
  }

  function showApp(){
    document.getElementById("loginScreen").style.display = "none";
    document.getElementById("appRoot").style.display = "block";
  }

  function showLogin(){
    document.getElementById("appRoot").style.display = "none";
    document.getElementById("loginScreen").style.display = "flex";
    document.getElementById("f-login-user").focus();
  }

  function shakeLoginBox(){
    const box = document.getElementById("loginBox");
    box.classList.remove("shake");
    void box.offsetWidth; // reinicia la animación
    box.classList.add("shake");
  }

  function handleLoginSubmit(evt){
    evt.preventDefault();

    const user = document.getElementById("f-login-user").value.trim();
    const pass = document.getElementById("f-login-pass").value;
    const errorEl = document.getElementById("loginError");

    if(user === VALID_USER && pass === VALID_PASS){
      sessionStorage.setItem(SESSION_KEY, "1");
      errorEl.classList.remove("show");
      showApp();
    }else{
      errorEl.classList.add("show");
      shakeLoginBox();
      document.getElementById("f-login-pass").value = "";
      document.getElementById("f-login-pass").focus();
    }
  }

  function handleLogout(){
    sessionStorage.removeItem(SESSION_KEY);
    document.getElementById("loginForm").reset();
    document.getElementById("loginError").classList.remove("show");
    showLogin();
  }

  function bind(){
    document.getElementById("loginForm").addEventListener("submit", handleLoginSubmit);
    document.getElementById("btnLogout").addEventListener("click", handleLogout);

    if(isLoggedIn()){
      showApp();
    }else{
      showLogin();
    }
  }

  return { bind, isLoggedIn };
})();
