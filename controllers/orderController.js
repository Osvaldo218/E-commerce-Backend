const Order = require("../models/Order");

// Crear orden por transferencia
const createTransferOrder = async (req, res) => {
  try {
    console.log("Usuario del token:", req.user);

    const { items, totalAmount, paymentMethodId } = req.body;

    // Validaciones
    if (!items || !items.length || !totalAmount) {
      return res
        .status(400)
        .json({ message: "Datos incompletos para crear la orden." });
    }

    // Crear la orden
    const newOrder = new Order({
      user: req.user._id,
      name: `Orden de ${req.user.name}`,
      items,
      totalAmount,
      paymentMethodId: paymentMethodId || null,
      status: "pendiente",
    });

    await newOrder.save();

    res.status(201).json({
      success: true,
      message: "Orden registrada correctamente",
      order: newOrder,
    });
  } catch (error) {
    console.error("❌ Error al crear orden por transferencia:", error);
    res.status(500).json({ message: "Error al procesar la orden." });
  }
};

// Obtener todas las órdenes del usuario autenticado
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).populate("items.product");
    res.json(orders);
  } catch (err) {
    console.error("Error al obtener pedidos:", err);
    res.status(500).json({ message: "Error del servidor" });
  }
};

module.exports = {
  createTransferOrder,
  getOrders,
};