const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  try {
    // Obtener el token del encabezado Authorization
    const token = req.headers.authorization?.split(" ")[1];
    console.log("📌 Token recibido:", token); // ✅ Muestra el token en la consola para depuración

    if (!token) {
      console.error("❌ No se envió token");
      return res.status(401).json({ message: "No autorizado. Token requerido." });
    }

    // 🔹 Verificar y decodificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("📌 Token decodificado:", decoded); // ✅ Muestra el token decodificado

    // 🔹 Buscar al usuario en la base de datos y agregarlo a `req.user`
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      console.error("❌ Usuario no encontrado en la base de datos.");
      return res.status(404).json({ message: "Usuario no encontrado." });
    }

    // Continuar con la siguiente función de middleware o ruta
    next();
  } catch (error) {
    console.error("❌ Error en autenticación:", error);

    // 🔹 Diferenciar errores de token expirado
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expirado. Inicia sesión nuevamente." });
    }

    // Otros errores de token (inválido o no presente)
    return res.status(401).json({ message: "Token no válido o expirado." });
  }
};

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    console.log("📌 Verificando rol:", req.user?.role); // ✅ Muestra el rol del usuario para depuración

    if (!req.user || !roles.includes(req.user.role)) {
      console.error("❌ Acceso denegado. Rol insuficiente.");
      return res.status(403).json({ message: "No tienes permisos para esta acción." });
    }

    // Continuar con la siguiente función de middleware o ruta
    next();
  };
};

module.exports = { protect, authorizeRoles };
