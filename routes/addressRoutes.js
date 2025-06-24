const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const Address = require("../models/Address");

// 📥 Crear nueva dirección
router.post("/", protect, async (req, res) => {
  try {
    const { alias, fullAddress, city, state, postalCode, country } = req.body;
    const newAddress = new Address({
      user: req.user._id,
      alias,
      fullAddress,
      city,
      state,
      postalCode,
      country,
    });

    await newAddress.save();
    res.status(201).json(newAddress);
  } catch (error) {
    res.status(500).json({ message: "Error al guardar la dirección", error });
  }
});

// 📤 Obtener direcciones del usuario
router.get("/", protect, async (req, res) => {
  try {
    const addresses = await Address.find({ user: req.user._id });
    res.json(addresses);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener las direcciones" });
  }
});

// 🗑️ Eliminar dirección
router.delete("/:id", protect, async (req, res) => {
  try {
    const deleted = await Address.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!deleted) return res.status(404).json({ message: "Dirección no encontrada" });

    res.json({ message: "Dirección eliminada correctamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar dirección" });
  }
});

module.exports = router;
