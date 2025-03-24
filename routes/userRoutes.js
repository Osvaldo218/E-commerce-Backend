const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { getUserProfile } = require("../controllers/userController.js");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

router.get("/profile", protect, getUserProfile);

// Ruta para obtener todos los usuarios
router.get("/", protect, authorizeRoles("admin"), async (req, res) => {
  try {
    const users = await User.find(); // Obtiene todos los usuarios
    res.json(users);
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
});

// Ruta para editar un usuario
router.put("/:id", protect, authorizeRoles("admin"), async (req, res) => {
  const { name, email, role } = req.body;

  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Actualizamos los valores solo si se envían en el request
    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;

    const updatedUser = await user.save(); // Guardar cambios en la base de datos

    res.json({ message: "Usuario actualizado correctamente", user: updatedUser });
  } catch (error) {
    console.error("Error al editar usuario:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
});

// Ruta para eliminar un usuario
router.delete("/:id", protect, authorizeRoles("admin"), async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    res.json({ message: "Usuario eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
});

module.exports = router;
