require("dotenv").config();

function required(name){
  const value = process.env[name];
  if(!value){
    throw new Error(`Falta la variable de entorno ${name}`);
  }
  return value;
}

module.exports = {
  port: process.env.PORT || 3000,
  databaseUrl: required("DATABASE_URL"),
  authUsername: required("AUTH_USERNAME"),
  authPasswordHash: required("AUTH_PASSWORD_HASH"),
  jwtSecret: required("JWT_SECRET"),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "12h",
  frontendOrigins: (process.env.FRONTEND_ORIGIN || "")
    .split(",")
    .map(s => s.trim())
    .filter(Boolean)
};
