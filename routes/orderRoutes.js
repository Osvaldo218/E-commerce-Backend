const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Order = require('../models/Order');

router.get('/', protect, async (req, res) => {
  try {
    console.log('📥 Usuario en GET orders:', req.user._id);
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    console.log('📦 Pedidos encontrados:', orders);
    res.json(orders);
  } catch (error) {
    console.error('❌ Error al obtener órdenes:', error);
    res.status(500).json({ message: 'Error al obtener órdenes' });
  }
});

module.exports = router;
