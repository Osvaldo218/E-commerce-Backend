const express = require("express");
const router = express.Router();
const Sale = require("../models/Sale");
const { getSalesStats } = require("../controllers/salesController");

router.get("/stats", getSalesStats);

// Registrar una venta
router.post("/", async (req, res) => {
  const { products } = req.body;
  try {
    const sale = new Sale({ products });
    await sale.save();
    res.json({ message: "Venta registrada", sale });
  } catch (error) {
    res.status(500).json({ error: "Error al registrar venta" });
  }
});

// Obtener todas las ventas
router.get("/", async (req, res) => {
  try {
    const sales = await Sale.find().populate("user", "name email");
    res.json(sales);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener ventas" });
  }
});

module.exports = router;
