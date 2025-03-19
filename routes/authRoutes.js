const express = require("express");
const router = express.Router();
const User = require("../models/User");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

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

    // Buscar usuario por email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Usuario no encontrado" });
    }

    // Comparar contraseña encriptada
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Contraseña incorrecta" });
    }

    // Crear token JWT con duración de 7 días
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" } // 🔥 Ahora dura 7 días
    );

    // Enviar token en una cookie segura
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días en milisegundos
    });

    res.status(200).json({ message: "Login exitoso", token });
  } catch (error) {
    res.status(500).json({ message: "Error en el servidor" });
  }
});

// Configurar transporte de correo
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// 🔹 Solicitar restablecimiento de contraseña
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

    // Crear token de restablecimiento
    const token = crypto.randomBytes(20).toString("hex");
    user.resetToken = token;
    user.tokenExpiration = Date.now() + 3600000; // 1 hora de validez
    await user.save();

    // Enviar correo con enlace de recuperación
    const resetUrl = `http://localhost:5173/reset-password/${token}`;
    await transporter.sendMail({
      to: user.email,
      subject: "Recuperación de Contraseña",
      html: `<p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
             <a href="${resetUrl}">${resetUrl}</a>`,
    });

    res.json({ message: "Correo de recuperación enviado" });
  } catch (error) {
    res.status(500).json({ message: "Error en el servidor" });
  }
});

// Restablecimiento de contraseña
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

module.exports = router;
