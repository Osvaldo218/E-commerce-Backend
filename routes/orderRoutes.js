const express = require("express");
const router = express.Router();
const { protect, authMiddleware, authorizeRoles } = require("../middleware/authMiddleware");
const {
  createStripeOrder,
  getAllOrders,
  getUserOrders,
  updateOrderStatus,
} = require("../controllers/orderController");

// Crear pedido
router.post("/", protect, createStripeOrder);

// Obtener todos los pedidos (solo admin)
router.get("/", protect, authorizeRoles("admin"), getAllOrders);

// ✅ Obtener pedidos del usuario autenticado
router.get("/user", authMiddleware, getUserOrders);

router.put('/:id/status', protect, authorizeRoles('admin'), updateOrderStatus);

router.post("/stripe", protect, createStripeOrder);

module.exports = router;
