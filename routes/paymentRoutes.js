// server/routes/payment.js
const express = require("express");
const router = express.Router();
const stripe = require("../stripe");

router.post("/create-payment-intent", async (req, res) => {
  const { amount } = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "mxn",
    });

    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Error al crear pago" });
  }
});

module.exports = router;
