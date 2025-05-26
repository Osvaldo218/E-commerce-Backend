const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");
const { createTransferOrder } = require("../controllers/orderController");

router.post("/transfer", protect, upload.single("proof"), createTransferOrder);

module.exports = router;
