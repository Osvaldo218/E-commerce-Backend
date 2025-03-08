const express = require("express");
const router = express.Router();
const Payment = require("../models/Payment");
const sendEmail = require("../utils/sendEmail");

router.post("/save-payment", async (req, res) => {
    try {
        const { userId, email, amount, paymentMethod, status } = req.body;
        const newPayment = new Payment({ userId, amount, paymentMethod, status });
        await newPayment.save();

        // Enviar correo de confirmación
        await sendEmail(email, "Confirmación de pago", `Tu pago de $${amount} fue exitoso.`);

        res.json({ message: "Pago guardado y correo enviado" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get("/history/:userId", async (req, res) => {
  try {
      const payments = await Payment.find({ userId: req.params.userId });
      res.json(payments);
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});

module.exports = router;
