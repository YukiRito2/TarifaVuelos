const jwt = require("jsonwebtoken");
const config = require("../config");
const ApiError = require("../utils/ApiError");

module.exports = function requireAuth(req, res, next){
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");

  if(scheme !== "Bearer" || !token){
    return next(new ApiError(401, "No autorizado"));
  }

  try{
    req.auth = jwt.verify(token, config.jwtSecret);
    next();
  }catch(err){
    next(new ApiError(401, "Sesión inválida o expirada"));
  }
};
