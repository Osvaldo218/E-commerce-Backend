const Order = require("../models/Order");

const createTransferOrder = async (req, res) => {
  try {
    const { items, totalAmount } = req.body;

    // Los items llegan como JSON string desde formData, parsear si es string
    let parsedItems = items;
    if (typeof items === "string") {
      parsedItems = JSON.parse(items);
    }

    if (!parsedItems || !Array.isArray(parsedItems) || parsedItems.length === 0) {
      return res.status(400).json({ message: "No se enviaron productos." });
    }

    if (!totalAmount || totalAmount <= 0) {
      return res.status(400).json({ message: "Monto total inválido." });
    }

    const proof = req.file?.filename || null;

    const newOrder = new Order({
      user: req.user._id,
      items: parsedItems,
      totalAmount,
      paymentMethod: "transferencia",
      status: "pendiente",
      proofOfTransfer: proof,
    });

    await newOrder.save();

    res.status(201).json({ message: "Orden registrada correctamente", order: newOrder });
  } catch (error) {
    console.error("❌ Error al crear orden por transferencia:", error);
    res.status(500).json({ message: "Error al procesar la orden." });
  }
};

module.exports = { createTransferOrder };
