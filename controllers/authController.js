const crypto = require("crypto");
const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  console.log("📩 Correo recibido en el backend:", email); // 🔍 Verifica qué se recibe

  try {
    const user = await User.findOne({ email });
    if (!user) {
      console.log("❌ Usuario no encontrado en la BD"); // 🔍 Verifica si realmente existe
      return res.status(404).json({ message: "No se encontró una cuenta con ese correo" });
    }

    // 🔹 Generar token de recuperación
    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // Token válido por 15 minutos
    await user.save();

    // 🔹 Crear enlace de recuperación
    const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;

    // 🔹 Contenido del correo
    const htmlMessage = `
      <h2>Recuperación de Contraseña</h2>
      <p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
      <a href="${resetUrl}" style="background: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Restablecer Contraseña</a>
      <p>Si no solicitaste esto, ignora este mensaje.</p>
    `;

    // 🔹 Enviar correo de recuperación
    await sendEmail({
      email: user.email,
      subject: "🔑 Recuperación de contraseña",
      message: `Haz clic en el siguiente enlace: ${resetUrl}`,
      htmlMessage
    });

    res.json({ message: "Correo enviado con instrucciones para restablecer la contraseña" });

  } catch (error) {
    console.error("❌ Error en forgotPassword:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
};
