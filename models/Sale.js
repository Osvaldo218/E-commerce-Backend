const mongoose = require("mongoose");

const SaleSchema = new mongoose.Schema({
  date: { type: String, required: true },
  total: { type: Number, required: true },
});

module.exports = mongoose.model("Sale", SaleSchema);
