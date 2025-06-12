const Order = require("../models/Order");
const path = require("path");
const fs = require("fs");

exports.createTransferOrder = async (req, res) => {
  try {
    const { totalAmount, items } = req.body;
    const userId = req.user?.id;
    const proofFile = req.file;

    // Verificación de datos obligatorios
    if (!totalAmount || !items || !proofFile || !userId) {
      if (proofFile?.path) fs.unlinkSync(proofFile.path);
      return res.status(400).json({ message: "Datos incompletos para crear la orden." });
    }

    // Validación de monto total
    const total = parseFloat(totalAmount);
    if (isNaN(total) || total <= 0) {
      fs.unlinkSync(proofFile.path);
      return res.status(400).json({ message: "El monto total no es válido." });
    }

    // Parseo y validación de items
    let parsedItems;
    try {
      parsedItems = JSON.parse(items);
      if (!Array.isArray(parsedItems) || parsedItems.length === 0) {
        fs.unlinkSync(proofFile.path);
        return res.status(400).json({ message: "La lista de productos está vacía o es inválida." });
      }
    } catch (err) {
      fs.unlinkSync(proofFile.path);
      return res.status(400).json({ message: "Formato de items inválido. Debe ser JSON." });
    }

    // Validación de tipo de archivo
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(proofFile.mimetype)) {
      fs.unlinkSync(proofFile.path);
      return res.status(400).json({ message: "Tipo de archivo no permitido. Solo JPG, PNG o PDF." });
    }

    // Crear y guardar la orden
    const newOrder = new Order({
      user: userId,
      items: parsedItems,
      totalAmount: total,
      paymentMethod: "transfer",
      proof: proofFile.filename,
      status: "pendiente",
    });

    await newOrder.save();

    return res.status(201).json({
      message: "Orden creada exitosamente",
      order: newOrder,
    });

  } catch (error) {
    console.error("❌ Error en createTransferOrder:", error);
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    return res.status(500).json({ message: "Error al crear la orden" });
  }
};
