const express = require("express");
const router = express.Router();
const Sale = require("../models/Sale");
const { getSalesStats } = require("../controllers/salesController");
const { protect } = require("../middleware/authMiddleware");

// 📊 Obtener estadísticas de ventas (controlador externo)
router.get("/stats", getSalesStats);

// ✅ Ruta de resumen para AdminDashboard
router.get("/summary", protect, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Acceso denegado" });
    }

    const sales = await Sale.find();

    const totalSales = sales.reduce((acc, sale) => acc + sale.total, 0);

    const chartData = sales.map((sale) => ({
      date: new Date(sale.date).toISOString().split("T")[0],
      total: sale.total,
    }));

    res.json({ totalSales, chartData });
  } catch (error) {
    console.error("Error en summary:", error);
    res.status(500).json({ message: "Error al obtener resumen de ventas" });
  }
});

// 🧾 Registrar una venta
router.post("/", async (req, res) => {
  const { products } = req.body;
  try {
    const total = products.reduce((acc, p) => acc + p.price * p.quantity, 0);

    const sale = new Sale({
      products,
      total,
      date: new Date(),
      user: req.user?.id || null, // opcional si manejas usuario
    });

    await sale.save();
    res.json({ message: "Venta registrada", sale });
  } catch (error) {
    res.status(500).json({ error: "Error al registrar venta" });
  }
});

// 📥 Obtener todas las ventas
router.get("/", async (req, res) => {
  try {
    const sales = await Sale.find().populate("user", "name email");
    res.json(sales);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener ventas" });
  }
});

module.exports = router;
