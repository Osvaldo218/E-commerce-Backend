const express = require("express");
const { getUserProfile } = require("../controllers/userController.js"); // ✅ Importar correctamente
const { protect } = require("../middleware/authMiddleware.js"); // ✅ Importar middleware correctamente

const router = express.Router();

// ✅ Asegurar que getUserProfile es una función válida
router.get("/profile", protect, getUserProfile);

module.exports = router;
