// middlewares/authMiddleware.js
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Middleware para proteger rutas con JWT
const protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      console.error("❌ No se envió token");
      return res.status(401).json({ message: "No autorizado. Token requerido." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Obtener el usuario sin incluir su contraseña
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      console.error("❌ Usuario no encontrado en la base de datos.");
      return res.status(404).json({ message: "Usuario no encontrado." });
    }

    next(); // Continúa hacia el controlador
  } catch (error) {
    console.error("❌ Error en autenticación:", error);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expirado. Inicia sesión nuevamente." });
    }

    return res.status(401).json({ message: "Token no válido o expirado." });
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
