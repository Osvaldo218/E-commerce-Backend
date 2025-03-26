const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

// ✅ Crear un producto (solo administradores)
router.post("/create", protect, authorizeRoles("admin"), async (req, res) => {
  try {
    const { name, price, stock, category, description, image } = req.body;

    if (!name || !price || stock === undefined) {
      return res.status(400).json({ message: "Faltan datos obligatorios" });
    }

    const newProduct = new Product({ name, price, stock, category, description, image });
    await newProduct.save();

    res.status(201).json(newProduct);
  } catch (error) {
    console.error("❌ Error al agregar producto:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
});

// ✅ Obtener la lista de productos (admin y empleados)
router.get("/list", protect, authorizeRoles("admin", "empleado"), async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    console.error("❌ Error al obtener productos:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
});

// ✅ Obtener productos con filtros y paginación opcional
router.get("/", async (req, res) => {
  try {
    let query = {};
    if (req.query.category) query.category = req.query.category;
    if (req.query.minStock) query.stock = { $gte: parseInt(req.query.minStock) };
    if (req.query.search) query.name = { $regex: req.query.search, $options: "i" };

    const page = parseInt(req.query.page);
    const limit = 5;
    const skip = page ? (page - 1) * limit : 0;

    const sortField = req.query.sort || "name";
    const sortOrder = req.query.order === "desc" ? -1 : 1;

    const totalProducts = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort({ [sortField]: sortOrder })
      .skip(skip)
      .limit(page ? limit : 0); // Si no hay paginación, devuelve todo

    // ✅ Corregido: Devuelve un array directamente
    res.json(products);
  } catch (error) {
    console.error("❌ Error al obtener productos:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
});

// ✅ Agregar un producto (sin roles)
router.post("/", async (req, res) => {
  try {
    const { name, price, stock, category, description, image } = req.body;

    if (!name || !price || stock === undefined) {
      return res.status(400).json({ message: "Faltan datos obligatorios" });
    }

    const newProduct = new Product({ name, price, stock, category, description, image });
    await newProduct.save();

    res.status(201).json(newProduct);
  } catch (error) {
    console.error("❌ Error al agregar producto:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
});

// ✅ Actualizar un producto
router.put("/:id", protect, authorizeRoles("admin"), async (req, res) => {
  try {
    const { name, price, stock, category, description, image } = req.body;

    if (!name || !price || stock === undefined) {
      return res.status(400).json({ message: "Faltan datos obligatorios" });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    // Actualizar los campos del producto
    product.name = name;
    product.price = price;
    product.stock = stock;
    product.category = category;
    product.description = description;
    product.image = image;

    // Guardar el producto actualizado
    await product.save();

    res.json(product);
  } catch (error) {
    console.error("❌ Error al actualizar producto:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
});

// ✅ Eliminar un producto
router.delete("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    await product.deleteOne();
    res.json({ message: "Producto eliminado correctamente" });
  } catch (error) {
    console.error("❌ Error al eliminar producto:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
});

module.exports = router;
