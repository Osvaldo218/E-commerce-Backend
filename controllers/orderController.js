const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const Order = require("../models/Order");

// Crear orden y pago con Stripe
const createStripeOrder = async (req, res) => {
  try {
    const { items, totalAmount, paymentMethodId } = req.body;

    if (!items || !items.length || !totalAmount || !paymentMethodId) {
      return res.status(400).json({ message: "Datos incompletos para crear la orden." });
    }

    // Crea un pago con Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalAmount * 100), // en centavos
      currency: "mxn", // o la moneda que uses
      payment_method: paymentMethodId,
      confirm: true, // confirma el pago inmediatamente
    });

    if (paymentIntent.status !== "succeeded") {
      return res.status(400).json({ message: "Pago no realizado." });
    }

    // Crea la orden en la base de datos
    const newOrder = new Order({
      user: req.user._id,
      name: `Orden de ${req.user.name}`,
      items,
      totalAmount,
      paymentMethodId,
      status: "pagado",
    });

    await newOrder.save();

    res.status(201).json({
      success: true,
      message: "Orden y pago registrados correctamente",
      order: newOrder,
      paymentIntent,
    });
  } catch (error) {
    console.error("❌ Error al crear orden con Stripe:", error);
    res.status(500).json({ message: "Error al procesar el pago." });
  }
};

module.exports = {
  createStripeOrder,
};
