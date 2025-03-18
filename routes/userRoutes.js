const express = require("express");
const { getUserProfile, getAllUsers, updateUser, deleteUser } = require("../controllers/userController.js"); // ✅ Importar correctamente
const { protect, authorizeRoles } = require("../middleware/authMiddleware"); // ✅ Importar middleware correctamente

const router = express.Router();

// ✅ Asegurar que getUserProfile es una función válida
router.get("/profile", protect, getUserProfile);

router.get("/", getAllUsers);

router.put("/users/:id", protect, authorizeRoles("admin"), updateUser);

router.delete("/users/:id", protect, authorizeRoles("admin"), deleteUser);

module.exports = router;
