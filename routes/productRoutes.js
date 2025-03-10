const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

// Ruta accesible solo para administradores
router.post("/create", protect, authorizeRoles("admin"), (req, res) => {
  res.json({ message: "Producto creado correctamente" });
});

// Ruta accesible para administradores y empleados
router.get("/list", protect, authorizeRoles("admin", "empleado"), (req, res) => {
  res.json({ message: "Lista de productos" });
});

// Obtener productos con filtros y paginación
router.get("/", async (req, res) => {
  try {
    let query = {};
    if (req.query.category) query.category = req.query.category;
    if (req.query.minStock) query.stock = { $gte: parseInt(req.query.minStock) };
    if (req.query.search) query.name = { $regex: req.query.search, $options: "i" };

    const page = parseInt(req.query.page) || 1;
    const limit = 5; // Número de productos por página
    const skip = (page - 1) * limit;

    const sortField = req.query.sort || "name";
    const sortOrder = req.query.order === "desc" ? -1 : 1;

    const totalProducts = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort({ [sortField]: sortOrder })
      .skip(skip)
      .limit(limit);

    res.json({
      products,
      totalPages: Math.ceil(totalProducts / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error("Error al obtener productos:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
});

// Agregar producto con validación de datos
router.post("/", async (req, res) => {
  try {
    const { name, price, stock, category, description } = req.body;

    if (!name || !price || stock === undefined) {
      return res.status(400).json({ message: "Faltan datos obligatorios" });
    }

    const newProduct = new Product({ name, price, stock, category, description });
    await newProduct.save();
    
    res.status(201).json(newProduct);
  } catch (error) {
    console.error("Error al agregar producto:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
});

// Eliminar producto con verificación
router.delete("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    await product.deleteOne();
    res.json({ message: "Producto eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar producto:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
});

module.exports = router;
