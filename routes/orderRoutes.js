const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const verifyToken = require("../middleware/verifyToken");
const { createTransferOrder } = require("../controllers/orderController");

router.post("/transfer", verifyToken, upload.single("proof"), createTransferOrder);

module.exports = router;
