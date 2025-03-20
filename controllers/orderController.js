const Order = require("../models/Order");
const Product = require("../models/Product");

// 🔹 Crear una nueva orden
const createOrder = async (req, res) => {
  try {
    const { orderItems, totalPrice } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: "No hay productos en la orden" });
    }

    const newOrder = new Order({
      user: req.user._id,
      orderItems,
      totalPrice,
    });

    await newOrder.save();
    res.status(201).json({ message: "Orden creada con éxito", order: newOrder });
  } catch (error) {
    console.error("Error al crear orden:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
};

// 🔹 Obtener todas las órdenes del usuario autenticado
const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).populate("orderItems.product", "name price");
    res.json(orders);
  } catch (error) {
    console.error("Error al obtener órdenes:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
};

// 🔹 Obtener todas las órdenes (solo admin)
const getAllOrders = async (req, res) => {
  try {
    console.log("📌 Usuario autenticado:", req.user); // ✅ Verifica si el usuario está autenticado

    const orders = await Order.find().populate("user", "name email");

    if (orders.length === 0) {
      return res.status(404).json({ message: "No hay pedidos disponibles" });
    }

    res.status(200).json(orders);
  } catch (error) {
    console.error("❌ Error al obtener pedidos:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
};
module.exports = { createOrder, getUserOrders, getAllOrders };
