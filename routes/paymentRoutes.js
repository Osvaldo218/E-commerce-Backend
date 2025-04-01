const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Sale = require("../models/Sale");

// Confirmar pago en Stripe
router.post("/confirm-payment", async (req, res) => {
  try {
    const { sessionId } = req.body;
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === "paid") {
      res.json({
        success: true,
        userId: session.customer_email,
        products: session.metadata.products,
        amount: session.amount_total / 100,
      });
    } else {
      res.json({ success: false });
    }
  } catch (error) {
    console.error("Error al confirmar pago:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Guardar la venta después del pago
router.post("/sales/create", async (req, res) => {
  try {
    const { userId, products, totalAmount, status } = req.body;
    const sale = new Sale({ userId, products, totalAmount, status });
    await sale.save();
    res.json({ success: true, message: "Venta registrada con éxito." });
  } catch (error) {
    console.error("Error al guardar la venta:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

console.log("Clave secreta de Stripe:", process.env.STRIPE_SECRET_KEY ? "Cargada correctamente" : "No encontrada");

module.exports = router;
