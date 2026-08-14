// Error "esperado" con un status HTTP explícito (400/401/404). El
// errorHandler central lo distingue de errores inesperados (500) para
// decidir qué mensaje exponer al cliente.
class ApiError extends Error {
  constructor(status, message){
    super(message);
    this.status = status;
  }
}

module.exports = ApiError;
