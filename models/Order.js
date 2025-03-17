const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  customerName: String,
  totalAmount: Number,
  status: {
    type: String,
    enum: ["Pendiente", "Enviado", "Completado"],
    default: "Pendiente",
  },
});

module.exports = mongoose.model("Order", orderSchema);