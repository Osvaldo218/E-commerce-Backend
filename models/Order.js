const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  name: String,
  items: [
    {
      name: String,
      price: Number,
      quantity: Number,
    },
  ],
  totalAmount: Number,
  paymentMethodId: String,
  status: {
    type: String,
    default: "pendiente",
  },
}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);
