const express = require("express");
const { createOrder, getUserOrders, getAllOrders } = require("../controllers/orderController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, createOrder); // 🔹 Crear una orden (usuario autenticado)
router.get("/", protect, getUserOrders); // 🔹 Obtener órdenes del usuario autenticado
router.get("/all", protect, authorizeRoles("admin"), getAllOrders); // 🔹 Obtener todas las órdenes (solo admin)

module.exports = router;
