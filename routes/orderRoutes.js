const express = require("express");
const router = express.Router();
const Order = require("../models/Order");

// Obtener todas las órdenes
router.get("/", async (req, res) => {
  try {
    const orders = await Order.find();
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Error en el servidor" });
  }
});

// Crear una nueva orden
router.post("/", async (req, res) => {
  try {
    const newOrder = new Order(req.body);
    await newOrder.save();
    res.status(201).json(newOrder);
  } catch (error) {
    res.status(500).json({ message: "Error en el servidor" });
  }
});

// Obtener órdenes con paginación y filtrado por estado
router.get("/", async (req, res) => {
  try {
    const { page = 1, limit = 5, status } = req.query;
    let query = {};
    if (status) query.status = status;

    const totalOrders = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      orders,
      totalPages: Math.ceil(totalOrders / limit),
    });
  } catch (error) {
    res.status(500).json({ message: "Error en el servidor" });
  }
});

// Actualizar estado de una orden
router.put("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: "Error en el servidor" });
  }
});

module.exports = router;
