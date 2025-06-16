const express = require("express");
const router = express.Router();
const { createStripeOrder } = require("../controllers/orderController");
const { protect } = require("../middleware/authMiddleware");

router.post("/stripe", protect, createStripeOrder);

module.exports = router;
