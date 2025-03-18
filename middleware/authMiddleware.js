const jwt = require("jsonwebtoken");
const User = require("../models/User.js");

const protect = async (req, res, next) => {
  let token = req.headers.authorization;

  if (!token || !token.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Acceso no autorizado" });
  }

  try {
    token = token.split(" ")[1]; // Extraer solo el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Buscar al usuario en la BD y excluir la contraseña
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({ message: "Usuario no encontrado" });
    }

    req.user = user; // Almacenar el usuario en `req.user`
    next();
  } catch (error) {
    console.error("Error en autenticación:", error);
    res.status(401).json({ message: "Token inválido" });
  }
};

const authorizeRoles = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ message: "No tienes permisos suficientes" });
  }
  next();
};

module.exports = { protect, authorizeRoles };
