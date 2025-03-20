const Product = require("../models/Product");

const createProduct = async (req, res) => {
  try {
    const { name, price, category, stock, description, image } = req.body;

    // 🔹 Crear el producto con los datos recibidos
    const product = new Product({
      name,
      price,
      category,
      stock,
      description,
      image,
      createdBy: req.user.id, // Guardar el admin que lo creó
    });

    await product.save();
    res.status(201).json({ message: "Producto creado exitosamente", product });
  } catch (error) {
    console.error("❌ Error al crear producto:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
};

module.exports = { createProduct };
