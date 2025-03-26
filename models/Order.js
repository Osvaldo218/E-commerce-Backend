const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    orderItems: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          default: 1,
        },
        price: {
          type: Number,
          required: true,
        },
      },
    ],
    totalPrice: {
      type: Number,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["Pendiente", "Pagado", "Cancelado"],
      default: "Pendiente",
    },
    paymentIntentId: {
      type: String, // Se almacena el ID de Stripe para verificar pagos
      required: false,
    },
    paymentMethod: {
      type: String,
      required: false,
    },
    orderStatus: {
      type: String,
      enum: ["Procesando", "Enviado", "Entregado", "Cancelado"],
      default: "Procesando",
    },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;
