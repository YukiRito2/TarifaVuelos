const ApiError = require("../utils/ApiError");

// eslint-disable-next-line no-unused-vars
module.exports = function errorHandler(err, req, res, next){
  if(err instanceof ApiError){
    return res.status(err.status).json({ error: err.message });
  }

  console.error("Error inesperado:", err);
  return res.status(500).json({ error: "Error interno del servidor" });
};
