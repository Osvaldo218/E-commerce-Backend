const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const { createTransferOrder } = require("../controllers/orderController");
const { protect } = require("../middleware/authMiddleware");

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});

const upload = multer({ storage });

router.post("/transfer", protect, upload.single("proof"), createTransferOrder);

module.exports = router;
