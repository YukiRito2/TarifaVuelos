window.Celina = window.Celina || {};

/**
 * Único punto de contacto con el backend (server/). Se encarga del
 * token de sesión y de tratar cualquier 401 de forma uniforme (fuerza
 * logout), para que el resto de la app nunca tenga que pensar en eso.
 */
Celina.api = (function(){
  const TOKEN_KEY = "celina_token";

  function getToken(){
    return sessionStorage.getItem(TOKEN_KEY);
  }

  function setToken(token){
    sessionStorage.setItem(TOKEN_KEY, token);
  }

  function clearToken(){
    sessionStorage.removeItem(TOKEN_KEY);
  }

  async function request(path, options){
    options = options || {};
    const token = getToken();

    const response = await fetch(Celina.config.API_BASE_URL + path, {
      method: options.method || "GET",
      body: options.body,
      headers: Object.assign(
        { "Content-Type": "application/json" },
        token ? { Authorization: `Bearer ${token}` } : {},
        options.headers || {}
      )
    });

    if(response.status === 401){
      Celina.auth.forceLogout();
      throw new Error("Sesión expirada, iniciá sesión de nuevo");
    }

    if(response.status === 204){
      return null;
    }

    const body = await response.json().catch(() => ({}));

    if(!response.ok){
      throw new Error(body.error || "Ocurrió un error inesperado");
    }

    return body;
  }

  function login(username, password){
    return request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password })
    });
  }

  function changePassword(currentPassword, newPassword){
    return request("/auth/password", {
      method: "PUT",
      body: JSON.stringify({ currentPassword, newPassword })
    });
  }

  function listQuotes(){
    return request("/quotes");
  }

  function createQuote(data){
    return request("/quotes", { method: "POST", body: JSON.stringify(data) });
  }

  function updateQuote(id, data){
    return request(`/quotes/${id}`, { method: "PUT", body: JSON.stringify(data) });
  }

  function softDeleteQuote(id){
    return request(`/quotes/${id}`, { method: "DELETE" });
  }

  function listTrash(){
    return request("/quotes/trash");
  }

  function restoreQuote(id){
    return request(`/quotes/${id}/restore`, { method: "POST" });
  }

  function permanentDeleteQuote(id){
    return request(`/quotes/${id}/permanent`, { method: "DELETE" });
  }

  return {
    getToken, setToken, clearToken,
    login, changePassword, listQuotes, createQuote, updateQuote, softDeleteQuote,
    listTrash, restoreQuote, permanentDeleteQuote
  };
})();
