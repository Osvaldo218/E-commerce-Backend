const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  alias: {
    type: String,
    default: "Mi dirección",
  },
  fullAddress: {
    type: String,
    required: true,
  },
  city: String,
  state: String,
  postalCode: String,
  country: {
    type: String,
    default: "México",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Address", addressSchema);
