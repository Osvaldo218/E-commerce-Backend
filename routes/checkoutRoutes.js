const express = require("express");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const jwt = require("jsonwebtoken");
const Order = require("../models/Order");

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

// ✅ Ruta correcta para crear sesión de pago
router.post("/create-session", authMiddleware, async (req, res) => {
  try {
    const { orderId } = req.body;
    if (!orderId) return res.status(400).json({ error: "Falta el ID de la orden." });

    const order = await Order.findById(orderId).populate("orderItems.product");
    if (!order) return res.status(404).json({ error: "Orden no encontrada" });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: order.orderItems.map((item) => ({
        price_data: {
          currency: "usd",
          product_data: { name: item.product.name },
          unit_amount: item.price * 100,
        },
        quantity: item.quantity,
      })),
      mode: "payment",
      success_url: `http://localhost:5173/orders?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: "http://localhost:5173/cancel",
      metadata: { orderId: order._id.toString() },
    });

    res.json({ sessionId: session.id });
  } catch (error) {
    console.error("Error al crear la sesión de pago:", error);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

// Exportar el router correctamente
module.exports = router;
