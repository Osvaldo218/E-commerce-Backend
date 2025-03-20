const express = require("express");
const { getUserProfile, getAllUsers, updateUser, deleteUser } = require("../controllers/userController.js");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/profile", protect, getUserProfile);
router.get("/", protect, authorizeRoles("admin"), getAllUsers);
router.put("/:id", protect, authorizeRoles("admin"), updateUser);
router.delete("/:id", protect, authorizeRoles("admin"), deleteUser);

router.get("/debug-user", protect, (req, res) => {
    console.log(req.user); // 📌 Verifica qué usuario está autenticado
    res.json(req.user);
  });  

module.exports = router;
