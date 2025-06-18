const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const Order = require("../models/Order");

const createStripeOrder = async (req, res) => {
  const { paymentMethodId, totalAmount, items } = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalAmount * 100),
      currency: "mxn",
      payment_method: paymentMethodId,
      confirm: true,
    });

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
      status: "pagado",
    });

    const savedOrder = await newOrder.save();

    res.status(201).json({ message: "Orden creada y pagada", order: savedOrder });
  } catch (error) {
    console.error("Error en createStripeOrder:", error.message);
    res.status(500).json({ message: "Error al procesar el pago o guardar la orden" });
  }
};

const getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const orders = await Order.find({ user: userId }).populate("user", "name");
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener las órdenes del usuario" });
  }
};

const getAllOrders = async (req, res) => {
  try {
    // Aquí también incluimos el nombre del usuario
    const orders = await Order.find({}).populate("user", "name");
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener todos los pedidos" });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { orderStatus } = req.body;

    const updated = await Order.findByIdAndUpdate(
      id,
      { status: orderStatus },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Orden no encontrada" });
    res.json({ success: true, order: updated });
  } catch (error) {
    console.error("❌ Error al actualizar estado:", error);
    res.status(500).json({ message: "Error actualizando el estado" });
  }
};

module.exports = {
  createStripeOrder,
  getAllOrders,
  getUserOrders,
  updateOrderStatus,
};
