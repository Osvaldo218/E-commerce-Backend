// orderController.js

const Order = require("../models/Order");

// Crear una orden
const createOrder = async (req, res) => {
  try {
    const { items, totalAmount } = req.body; // Datos esperados en la solicitud

    if (!items || items.length === 0 || !totalAmount) {
      return res.status(400).json({ message: "Datos incompletos para crear la orden" });
    }

    const newOrder = new Order({
      user: req.user._id, // El usuario autenticado
      items,
      totalAmount,
      status: "pending", // Estado de la orden
    });

    await newOrder.save();
    res.status(201).json(newOrder); // Orden creada con éxito
  } catch (error) {
    console.error("❌ Error al crear la orden:", error);
    res.status(500).json({ message: "Error al crear la orden" });
  }
};

// Obtener órdenes del usuario
const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id });
    res.status(200).json(orders); // Devolver las órdenes del usuario
  } catch (error) {
    console.error("❌ Error al obtener órdenes del usuario:", error);
    res.status(500).json({ message: "Error al obtener las órdenes del usuario" });
  }
};

// Obtener todas las órdenes (solo admin)
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find();
    res.status(200).json(orders); // Devolver todas las órdenes
  } catch (error) {
    console.error("❌ Error al obtener todas las órdenes:", error);
    res.status(500).json({ message: "Error al obtener todas las órdenes" });
  }
};

module.exports = { createOrder, getUserOrders, getAllOrders };
