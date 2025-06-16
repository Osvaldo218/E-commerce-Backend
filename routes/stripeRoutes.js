const express = require("express");
const router = express.Router();
const Stripe = require("stripe");
const stripe = Stripe("sk_test_51QzKH7ITGEX0lpDO4DA5imVVdcFhBLZsscJBwaBHOexSthYZ9YJCExQdEhq3Ych6E0S1m5GR6E9qkHaOsPGSiuUm00DmFVdhU8");

router.post("/stripe", async (req, res) => {
  const { paymentMethodId, totalAmount, items } = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalAmount * 100),
      currency: "mxn",
      payment_method: paymentMethodId,
      confirm: true,
    });

    res.json({ message: "Pago procesado", paymentIntentId: paymentIntent.id });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
