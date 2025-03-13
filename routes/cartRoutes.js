const express = require("express");
const jwt = require("jsonwebtoken");
const Cart = require("../models/Cart");

const router = express.Router();

// Middleware de autenticación
const authMiddleware = (req, res, next) => {
  const token = req.header("Authorization");
  if (!token) return res.status(401).json({ error: "Acceso denegado" });

  try {
    const verified = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    res.status(401).json({ error: "Token inválido" });
  }
};

// Agregar producto al carrito
router.post("/add", authMiddleware, async (req, res) => {
  const { productId, quantity } = req.body;
  const cart = await Cart.findOne({ userId: req.user.userId }) || new Cart({ userId: req.user.userId, items: [] });

  const existingItem = cart.items.find((item) => item.productId === productId);
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.items.push({ productId, quantity });
  }

  await cart.save();
  res.json({ message: "Producto agregado al carrito", cart });
});

// Obtener carrito del usuario
router.get("/", authMiddleware, async (req, res) => {
  const cart = await Cart.findOne({ userId: req.user.userId }).populate("items.productId");
  res.json(cart || { items: [] });
});

module.exports = router;
