window.Celina = window.Celina || {};

/**
 * Login real contra el backend (server/): usuario y contraseña
 * compartidos, validados server-side, con un token de sesión (JWT)
 * que expira solo. Ya no hay credenciales escritas en este archivo.
 */
Celina.auth = (function(){
  // Recordada solo en memoria (nunca en localStorage/sessionStorage) para
  // poder precargar el campo "contraseña actual" del modal de cambio de
  // contraseña — pensado para una única dueña de la cuenta compartida,
  // no para varias personas usando el mismo dispositivo. Se pierde sola
  // al recargar la página o cerrar sesión.
  let lastPassword = null;

  function isLoggedIn(){
    return !!Celina.api.getToken();
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

  async function handleLoginSubmit(evt){
    evt.preventDefault();

    const user = document.getElementById("f-login-user").value.trim();
    const pass = document.getElementById("f-login-pass").value;
    const errorEl = document.getElementById("loginError");
    const submitBtn = evt.target.querySelector('button[type="submit"]');

    submitBtn.disabled = true;

    try{
      const { token } = await Celina.api.login(user, pass);
      Celina.api.setToken(token);
      lastPassword = pass;
      errorEl.classList.remove("show");
      showApp();
      await Celina.main.loadAppData();
    }catch(err){
      errorEl.textContent = "⚠️ " + (err.message || "Usuario o contraseña incorrectos.");
      errorEl.classList.add("show");
      shakeLoginBox();
      document.getElementById("f-login-pass").value = "";
      document.getElementById("f-login-pass").focus();
    }finally{
      submitBtn.disabled = false;
    }
  }

  /**
   * Cierra la sesión sin llamar al servidor (el JWT no se puede
   * "invalidar" del lado del cliente; simplemente se descarta acá y
   * queda vencido solo con el tiempo). La usan tanto el botón de
   * logout como el manejo automático de un 401 en js/api.js.
   */
  function forceLogout(){
    Celina.api.clearToken();
    Celina.state.quotes = [];
    Celina.state.trash = [];
    Celina.state.currentQuote = null;
    Celina.state.editingId = null;
    lastPassword = null;
    showLogin();
  }

  function handleLogout(){
    forceLogout();
    document.getElementById("loginForm").reset();
    document.getElementById("loginError").classList.remove("show");
  }

  function openChangePasswordModal(){
    document.getElementById("changePasswordForm").reset();
    // Precarga la contraseña actual (recordada en memoria desde el
    // login) para no tener que volver a escribirla.
    document.getElementById("f-current-pass").value = lastPassword || "";
    document.getElementById("changePasswordError").classList.remove("show");
    document.getElementById("changePasswordModal").classList.add("show");
    document.getElementById("f-new-pass").focus();
  }

  function closeChangePasswordModal(){
    document.getElementById("changePasswordModal").classList.remove("show");
  }

  async function handleChangePasswordSubmit(evt){
    evt.preventDefault();

    const currentPass = document.getElementById("f-current-pass").value;
    const newPass = document.getElementById("f-new-pass").value;
    const newPassConfirm = document.getElementById("f-new-pass-confirm").value;
    const errorEl = document.getElementById("changePasswordError");
    const submitBtn = evt.target.querySelector('button[type="submit"]');

    if(newPass !== newPassConfirm){
      errorEl.textContent = "⚠️ Las contraseñas nuevas no coinciden.";
      errorEl.classList.add("show");
      return;
    }

    submitBtn.disabled = true;
    try{
      await Celina.api.changePassword(currentPass, newPass);
      lastPassword = newPass;
      closeChangePasswordModal();
      Celina.utils.showToast("✅ Contraseña actualizada");
    }catch(err){
      errorEl.textContent = "⚠️ " + err.message;
      errorEl.classList.add("show");
    }finally{
      submitBtn.disabled = false;
    }
  }

  function bind(){
    document.getElementById("loginForm").addEventListener("submit", handleLoginSubmit);
    document.getElementById("btnLogout").addEventListener("click", handleLogout);

    document.getElementById("btnChangePassword").addEventListener("click", openChangePasswordModal);
    document.getElementById("btnCancelChangePassword").addEventListener("click", closeChangePasswordModal);
    document.getElementById("changePasswordForm").addEventListener("submit", handleChangePasswordSubmit);
    document.getElementById("changePasswordModal").addEventListener("click", evt => {
      if(evt.target.id === "changePasswordModal") closeChangePasswordModal();
    });

    if(isLoggedIn()){
      showApp();
    }else{
      showLogin();
    }
  }

  return { bind, isLoggedIn, forceLogout };
})();
