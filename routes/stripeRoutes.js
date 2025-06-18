const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const Order = require('../models/Order');

router.post("/pagar", protect, async (req, res) => {
  const { paymentMethodId, totalAmount, items } = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalAmount * 100),
      currency: "mxn",
      payment_method: paymentMethodId,
      confirm: true,
    });

    // Crear y guardar la orden
    const newOrder = new Order({
      user: req.user._id,
      items: items.map((item) => ({
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
      totalAmount,
      paymentMethodId,
      status: "Pagado",
    });

    const savedOrder = await newOrder.save();

    res.status(201).json({ message: "Orden creada y pagada", order: savedOrder });
  } catch (error) {
    console.error("❌ Error al pagar y guardar orden:", error);
    res.status(500).json({ message: "Error al procesar el pago o guardar la orden" });
  }
});

module.exports = router;
