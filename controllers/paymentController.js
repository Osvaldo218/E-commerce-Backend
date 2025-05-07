const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Crear intención de pago
exports.createPaymentIntent = async (req, res) => {
  try {
    const { amount, currency = 'usd', metadata = {} } = req.body;

    // Validar el monto
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Monto inválido' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe usa centavos
      currency,
      metadata,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error('Error al crear intención de pago:', error);
    res.status(500).json({ error: error.message });
  }
};

// Manejar webhook de Stripe
exports.handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error(`⚠️ Error de verificación webhook: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Manejar diferentes eventos de Stripe
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log(`Pago exitoso: ${paymentIntent.id}`);
      // Aquí actualizarías tu base de datos
      break;
    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object;
      console.log(`Pago fallido: ${failedPayment.id}`);
      break;
    default:
      console.log(`Evento no manejado: ${event.type}`);
  }

  res.json({ received: true });
};