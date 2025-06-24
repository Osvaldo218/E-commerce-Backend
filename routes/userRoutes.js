const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { getUserProfile, getUserAddresses, addUserAddress, deleteUserAddress, } = require("../controllers/userController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

router.get("/profile", protect, getUserProfile);

// ✅ Obtener direcciones del usuario
router.get("/addresses", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ addresses: user.addresses || [] });
  } catch (error) {
    console.error("Error al obtener direcciones:", error);
    res.status(500).json({ message: "Error al obtener direcciones" });
  }
});

// ✅ Agregar una nueva dirección
router.post("/addresses", protect, async (req, res) => {
  const { address } = req.body;

  if (!address || address.trim() === "") {
    return res.status(400).json({ message: "La dirección no puede estar vacía." });
  }

  try {
    const user = await User.findById(req.user._id);
    user.addresses.push(address);
    await user.save();

    res.status(201).json({ message: "Dirección guardada", addresses: user.addresses });
  } catch (error) {
    console.error("Error al guardar dirección:", error);
    res.status(500).json({ message: "Error al guardar dirección" });
  }
});

// ✅ Eliminar una dirección
router.delete("/addresses", protect, async (req, res) => {
  const { address } = req.body;

  try {
    const user = await User.findById(req.user._id);
    user.addresses = user.addresses.filter((a) => a !== address);
    await user.save();

    res.json({ message: "Dirección eliminada", addresses: user.addresses });
  } catch (error) {
    console.error("Error al eliminar dirección:", error);
    res.status(500).json({ message: "Error al eliminar dirección" });
  }
});

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

router.get("/addresses", protect, getUserAddresses);
router.post("/addresses", protect, addUserAddress);
router.delete("/addresses", protect, deleteUserAddress);

module.exports = router;
