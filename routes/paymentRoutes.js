const express = require('express');
const router = express.Router();
const {
  createPaymentIntent,
  handleWebhook
} = require('../controllers/paymentController');

// Ruta para crear intención de pago
router.post('/create-payment-intent', createPaymentIntent);

// Ruta para webhook de Stripe (necesita formato raw)
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

module.exports = router;