const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("../config");
const authService = require("../services/auth.service");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");

const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body || {};

  if(!username || !password){
    throw new ApiError(400, "Usuario y contraseña son obligatorios");
  }

  const credentials = await authService.getCredentials();
  const validUser = username === credentials.username;
  const validPass = validUser && await bcrypt.compare(password, credentials.password_hash);

  if(!validUser || !validPass){
    throw new ApiError(401, "Usuario o contraseña incorrectos");
  }

  const token = jwt.sign(
    { sub: "agent", role: "shared-agent" },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );

  res.json({ token, expiresIn: config.jwtExpiresIn });
});

const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body || {};

  if(!currentPassword || !newPassword){
    throw new ApiError(400, "La contraseña actual y la nueva son obligatorias");
  }
  if(newPassword.length < 6){
    throw new ApiError(400, "La nueva contraseña debe tener al menos 6 caracteres");
  }

  const credentials = await authService.getCredentials();
  const validCurrent = await bcrypt.compare(currentPassword, credentials.password_hash);

  if(!validCurrent){
    // 400 y no 401 a propósito: es un dato mal ingresado en una request
    // ya autenticada, no un problema de sesión — así el frontend no lo
    // confunde con un token vencido y fuerza un logout de más.
    throw new ApiError(400, "La contraseña actual no es correcta");
  }

  const newHash = await bcrypt.hash(newPassword, 10);
  await authService.updatePassword(newHash);

  res.json({ ok: true });
});

module.exports = { login, changePassword };
