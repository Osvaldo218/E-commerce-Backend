const User = require("../models/User.js");

const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    res.json(user);
  } catch (error) {
    console.error("Error al obtener perfil:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

module.exports = { getUserProfile }; // ✅ Exportar correctamente
