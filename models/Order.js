const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  items: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      name: String,
      price: Number,
      quantity: Number,
    },
  ],
  totalAmount: {
    type: Number,
    required: true,
  },
  paymentMethodId: {
    type: String,
  },
  shippingOption: {
    type: String,
    enum: ["domicilio", "almacen"],
    required: true,
  },
  shippingAddress: {
    type: String,
    default: "",
  },
  status: {
    type: String,
    enum: ["pendiente", "pagado", "enviado", "entregado", "cancelado"],
    default: "pendiente",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Order", orderSchema);
