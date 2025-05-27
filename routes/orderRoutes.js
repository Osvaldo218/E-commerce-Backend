const express = require("express");
const router = express.Router();
const { createTransferOrder, getOrders } = require("../controllers/orderController");
const verifyToken = require("../middleware/verifyToken");

router.post("/transfer", verifyToken, createTransferOrder);
router.get("/", verifyToken, getOrders);

module.exports = router;