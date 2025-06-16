const express = require('express');
const router = express.Router();
const { createStripeOrder } = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');
const Order = require('../models/Order');

// Ruta para crear orden (POST) - protegida
router.post('/', protect, createStripeOrder);

// Ruta para obtener órdenes del usuario autenticado (GET) - protegida
router.get('/', protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error('❌ Error al obtener órdenes:', error);
    res.status(500).json({ message: 'Error al obtener las órdenes' });
  }
});

module.exports = router;
