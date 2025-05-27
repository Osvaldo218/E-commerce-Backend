const jwt = require("jsonwebtoken");

// Reemplaza esto por tu clave secreta JWT real (debería estar en variables de entorno)
const JWT_SECRET = process.env.JWT_SECRET || "mi_secreto_super_seguro";

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No autorizado. Token faltante." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Puedes acceder luego a req.user.id, etc.
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token inválido o expirado." });
  }
};

module.exports = verifyToken;
