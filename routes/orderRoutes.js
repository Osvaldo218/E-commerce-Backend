const express = require("express");
const router = express.Router();

const {
  createStripeOrder,
  getAllOrders,
  getUserOrders,
  updateOrderStatus,
} = require("../controllers/orderController");

const {
  protect,
  authorizeRoles,
} = require("../middleware/authMiddleware");

// 🧾 Crear una nueva orden con pago (Stripe)
router.post("/stripe", protect, createStripeOrder);

// Opcional: ruta /pagar si quieres mantenerla separada (puedes eliminarla si no)
router.post("/pagar", protect, createStripeOrder);

// 📦 Obtener todas las órdenes (solo admin)
router.get("/", protect, authorizeRoles("admin"), getAllOrders);

// 📦 Obtener órdenes del usuario autenticado
router.get("/user", protect, getUserOrders);

// 🔁 Actualizar el estado de una orden (admin)
router.put("/:id/status", protect, authorizeRoles("admin"), updateOrderStatus);

module.exports = router;
