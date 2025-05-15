// routes/payment.js o controller/paymentController.js
const express = require("express");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const router = express.Router();

router.post("/create-checkout-session", async (req, res) => {
  try {
    const { cartItems, userEmail } = req.body;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: userEmail,
      line_items: cartItems.map((item) => ({
        price_data: {
          currency: "usd",
          product_data: {
            name: item.name,
          },
          unit_amount: Math.round(item.price * 100), // en centavos
        },
        quantity: item.quantity,
      })),
      success_url: `${process.env.CLIENT_URL}/checkout?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/cart`,
    });

    res.json({ sessionId: session.id });
  } catch (error) {
    console.error("Error creando sesión de Stripe:", error);
    res.status(500).json({ error: "Error creando sesión de pago" });
  }
});

module.exports = router;
