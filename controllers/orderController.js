const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const Order = require("../models/Order");

// ✅ Crear orden y procesar pago con Stripe
const createStripeOrder = async (req, res) => {
  try {
    const { items, totalAmount, paymentMethodId } = req.body;

    // 🔒 Validar datos esenciales
    if (!items || !Array.isArray(items) || items.length === 0 || !totalAmount || !paymentMethodId) {
      return res.status(400).json({ message: "Faltan datos para procesar el pago." });
    }

    // 💳 Crear intención de pago
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalAmount * 100), // Convertir a centavos
      currency: "mxn",
      payment_method: paymentMethodId,
      confirm: true,
      return_url: "https://pointec-murex.vercel.app/user/orders",
    });

    // 🔁 Validar que el pago haya sido exitoso
    if (paymentIntent.status !== "succeeded") {
      return res.status(400).json({ message: "El pago no fue completado." });
    }

    // 📦 Crear orden en la base de datos
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
      message: "✅ Orden y pago registrados correctamente",
      order: newOrder,
      paymentIntent,
    });
  } catch (error) {
    console.error("❌ Error en createStripeOrder:", error);
    res.status(500).json({
      message: "Error al procesar el pago.",
      error: error.message || "Error interno del servidor",
    });
  }
};

// 📦 Obtener órdenes del usuario autenticado
const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).populate("user", "name");
    res.status(200).json(orders);
  } catch (error) {
    console.error("❌ Error al obtener órdenes del usuario:", error);
    res.status(500).json({ message: "Error al obtener tus órdenes" });
  }
};

// 👨‍💼 Obtener todas las órdenes (admin)
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate("user", "name");
    res.status(200).json(orders);
  } catch (error) {
    console.error("❌ Error al obtener todas las órdenes:", error);
    res.status(500).json({ message: "Error al obtener todas las órdenes" });
  }
};

// 🔁 Actualizar estado de una orden (admin)
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { orderStatus } = req.body;

    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { status: orderStatus },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: "Orden no encontrada" });
    }

    res.json({ success: true, order: updatedOrder });
  } catch (error) {
    console.error("❌ Error al actualizar estado de orden:", error);
    res.status(500).json({ message: "Error al actualizar el estado de la orden" });
  }
};

const getTotalSales = async (req, res) => {
  try {
    const result = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalSales: { $sum: "$totalAmount" },
          totalOrders: { $sum: 1 }
        }
      }
    ]);

    const stats = result[0] || { totalSales: 0, totalOrders: 0 };
    res.json(stats);
  } catch (error) {
    console.error("❌ Error al calcular total sales:", error);
    res.status(500).json({ message: "Error al obtener estadísticas" });
  }
};

module.exports = {
  createStripeOrder,
  getUserOrders,
  getAllOrders,
  updateOrderStatus,
  getTotalSales,
};
