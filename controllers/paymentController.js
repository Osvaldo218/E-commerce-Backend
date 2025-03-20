const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Order = require("../models/Order");

exports.handleStripeWebhook = async (req, res) => {
    const sig = req.headers["stripe-signature"];
  
    try {
        const event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);

        if (event.type === "checkout.session.completed") {
            const session = event.data.object;
            
            // Buscar el pedido por el ID de la sesión
            const order = await Order.findOne({ stripeSessionId: session.id });
            if (order) {
                order.status = "Pagado";
                order.paymentInfo = {
                    id: session.payment_intent,
                    method: session.payment_method_types[0],
                    amount: session.amount_total / 100,
                    currency: session.currency,
                };
                await order.save();
            }
        }

        res.json({ received: true });
    } catch (err) {
        console.error("Error en el webhook de Stripe:", err);
        res.status(400).send(`Webhook Error: ${err.message}`);
    }
};
