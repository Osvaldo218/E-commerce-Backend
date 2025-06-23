const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select("-password");
      next();
    } catch (error) {
      return res.status(401).json({ message: "Token inválido o expirado" });
    }
  } else {
    return res.status(401).json({ message: "No autorizado, token faltante" });
  }
};

// Middleware para verificar roles permitidos
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      console.error("❌ Acceso denegado. Rol insuficiente.");
      return res.status(403).json({ message: "No tienes permisos para esta acción." });
    }

    next();
  };
};

module.exports = { protect, authorizeRoles };
