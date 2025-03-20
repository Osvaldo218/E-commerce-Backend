const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    console.log("📌 Token recibido:", token); // ✅ Muestra el token en la consola

    if (!token) {
      console.error("❌ No se envió token");
      return res.status(401).json({ message: "No autorizado. Token requerido." });
    }

    // 🔹 Verificamos y decodificamos el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("📌 Token decodificado:", decoded);

    // 🔹 Buscar usuario en la base de datos
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      console.error("❌ Usuario no encontrado en la BD");
      return res.status(404).json({ message: "Usuario no encontrado." });
    }

    next();
  } catch (error) {
    console.error("❌ Error en autenticación:", error);

    // 🔹 Diferenciar error de token expirado
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expirado. Inicia sesión nuevamente." });
    }

    res.status(401).json({ message: "Token no válido o expirado." });
  }
};

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    console.log("📌 Verificando rol:", req.user?.role); // ✅ Verifica qué rol tiene el usuario

    if (!req.user || !roles.includes(req.user.role)) {
      console.error("❌ Acceso denegado. Rol insuficiente.");
      return res.status(403).json({ message: "No tienes permisos para esta acción." });
    }

    next();
  };
};

module.exports = { protect, authorizeRoles };
