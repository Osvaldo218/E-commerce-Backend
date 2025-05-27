const multer = require("multer");
const fs = require("fs");
const path = require("path");

// Crear carpeta si no existe
const transferPath = path.join(__dirname, "../uploads/transfers");
if (!fs.existsSync(transferPath)) {
  fs.mkdirSync(transferPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, transferPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  },
});

const upload = multer({ storage });

module.exports = upload;
