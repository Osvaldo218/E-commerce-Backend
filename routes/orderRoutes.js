const express = require("express");
const { createOrder, getUserOrders, getAllOrders } = require("../controllers/orderController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

const router = express.Router();

// 🔹 Crear una orden (usuario autenticado)
router.post("/", protect, createOrder); 

// 🔹 Obtener órdenes del usuario autenticado
router.get("/", protect, getUserOrders); 

// 🔹 Obtener todas las órdenes (solo admin)
router.get("/all", protect, authorizeRoles("admin"), getAllOrders); 

module.exports = router;
