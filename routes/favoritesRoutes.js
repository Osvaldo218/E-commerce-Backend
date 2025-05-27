// routes/favorites.js
const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const User = require("../models/User");

// Añadir producto a favoritos
router.post("/add/:productId", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const productId = req.params.productId;

    if (!user.favorites.includes(productId)) {
      user.favorites.push(productId);
      await user.save();
    }

    res.json({ message: "Producto añadido a favoritos" });
  } catch (err) {
    res.status(500).json({ message: "Error al añadir a favoritos" });
  }
});

// Eliminar producto de favoritos
router.delete("/remove/:productId", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.favorites = user.favorites.filter(
      (id) => id.toString() !== req.params.productId
    );
    await user.save();
    res.json({ message: "Producto eliminado de favoritos" });
  } catch (err) {
    res.status(500).json({ message: "Error al eliminar de favoritos" });
  }
});

// Obtener favoritos del usuario
router.get("/", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("favorites");
    res.json(user.favorites);
  } catch (err) {
    res.status(500).json({ message: "Error al obtener favoritos" });
  }
});

module.exports = router;
