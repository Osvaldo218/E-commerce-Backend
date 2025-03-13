const express = require("express");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
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

// Crear sesión de pago en Stripe
router.post("/create-session", authMiddleware, async (req, res) => {
  const cart = await Cart.findOne({ userId: req.user.userId }).populate("items.productId");
  if (!cart || cart.items.length === 0) return res.status(400).json({ error: "El carrito está vacío" });

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: cart.items.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: { name: item.productId.name },
        unit_amount: item.productId.price * 100,
      },
      quantity: item.quantity,
    })),
    mode: "payment",
    success_url: "http://localhost:5173/success",
    cancel_url: "http://localhost:5173/cancel",
  });

  res.json({ sessionId: session.id });
});

module.exports = router;
