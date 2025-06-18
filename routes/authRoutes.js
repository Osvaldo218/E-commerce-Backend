const express = require("express");
const router = express.Router();
const User = require("../models/User");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const { protect } = require("../middleware/authMiddleware");
const { verifyEmail } = require("../controllers/authController"); // Importa el controlador

dotenv.config();

// Registro de usuario
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "El usuario ya existe" });

    user = new User({ name, email, password, role });
    await user.save();

    res.status(201).json({ message: "Usuario registrado correctamente" });
  } catch (error) {
    res.status(500).json({ message: "Error en el servidor" });
  }
});

// Inicio de sesión
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Usuario no encontrado" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Contraseña incorrecta" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({ message: "Login exitoso", token });
  } catch (error) {
    res.status(500).json({ message: "Error en el servidor" });
  }
});

router.post("/verify-email", verifyEmail);

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

    res.json({ message: "Instrucciones para restablecer la contraseña enviadas al email" });
  } catch (error) {
    console.error("❌ Error en forgot-password:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
});

router.post("/reset-password/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    const user = await User.findOne({
      resetToken: token,
      tokenExpiration: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ message: "Token inválido o expirado" });

    // Encriptar nueva contraseña
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.resetToken = null;
    user.tokenExpiration = null;
    await user.save();

    res.json({ message: "Contraseña restablecida con éxito" });
  } catch (error) {
    res.status(500).json({ message: "Error en el servidor" });
  }
});

// Cerrar sesión
router.post("/logout", (req, res) => {
  res.cookie("token", "", { httpOnly: true, expires: new Date(0) });
  res.json({ message: "Sesión cerrada correctamente" });
});

router.get("/user", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

    res.json(user);
  } catch (error) {
    console.error("❌ Error obteniendo usuario:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
});

router.get("/me", protect, (req, res) => {
  res.status(200).json({ user: req.user });
});

module.exports = router;
