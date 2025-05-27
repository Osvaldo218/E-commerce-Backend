const User = require('../models/User');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');
const verifyEmail = require('../utils/verifyEmail')
const validator = require('validator');

// Configuración
const RESET_TOKEN_EXPIRATION = 3600000; // 1 hora
const FRONTEND_RESET_URL = process.env.FRONTEND_RESET_URL || 'https://pointec-murex.vercel.app/reset-password';

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Correo y contraseña son obligatorios" });
    }

    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    if (!user.verified) {
      return res.status(403).json({ message: "Verifica tu correo antes de iniciar sesión" });
    }

    const token = jwt.sign(
      { _id: user._id, name: user.name, email: user.email },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      message: "Inicio de sesión exitoso",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
      }
    });

  } catch (error) {
    console.error("❌ Error al iniciar sesión:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
};

// ✅ Registrar nuevo usuario y enviar código de verificación
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Todos los campos son obligatorios' });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ success: false, message: 'Correo electrónico no válido' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Este correo ya está registrado' });
    }

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString(); // Código de 6 dígitos

    const user = new User({
      name,
      email,
      password,
      verificationCode,
      verificationExpires: Date.now() + 10 * 60 * 1000 // 10 minutos
    });

    await user.save();

    await verifyEmail({
      email: user.email,
      subject: 'Código de verificación',
      html: `<h3>Tu código de verificación es:</h3><p style="font-size: 24px;"><b>${verificationCode}</b></p><p>Este código expirará en 10 minutos.</p>`
    });

    res.status(201).json({
      success: true,
      message: 'Usuario registrado. Verifica tu correo con el código enviado.'
    });
  } catch (error) {
    console.error('❌ Error en registerUser:', error);
    res.status(500).json({ success: false, message: 'Error al registrar usuario' });
  }
};

// ✅ Verificar código de verificación
exports.verifyEmail = async (req, res) => {
  try {
    const { email, code } = req.body;

    const user = await User.findOne({
      email,
      verificationCode: code,
      verificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Código inválido o expirado' });
    }

    user.verified = true;
    user.verificationCode = undefined;
    user.verificationExpires = undefined;
    await user.save();

    res.status(200).json({ success: true, message: 'Correo verificado exitosamente' });
  } catch (error) {
    console.error('❌ Error en verifyEmail:', error);
    res.status(500).json({ success: false, message: 'Error al verificar el correo' });
  }
};

// 🔁 forgotPassword y resetPassword como ya los tenías...
exports.forgotPassword = async (req, res) => {
  try {
    res.header('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGINS || '*');
    res.header('Access-Control-Allow-Methods', 'POST');

    const { email } = req.body;
    if (!email || !validator.isEmail(email)) {
      return res.status(400).json({ success: false, message: 'Por favor proporciona un email válido' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'Si este email existe, recibirás instrucciones para restablecer la contraseña'
      });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.resetPasswordToken = resetPasswordToken;
    user.resetPasswordExpire = Date.now() + RESET_TOKEN_EXPIRATION;
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${FRONTEND_RESET_URL}?token=${resetToken}`;
    const message = `
      <h2>Solicitud de restablecimiento de contraseña</h2>
      <p>Haz clic en el enlace para continuar:</p>
      <a href="${resetUrl}" target="_blank">Restablecer contraseña</a>
      <p>Este enlace expirará en 1 hora.</p>
    `;

    await sendEmail({
      email: user.email,
      subject: 'Instrucciones para restablecer tu contraseña',
      html: message
    });

    return res.status(200).json({
      success: true,
      message: 'Si este email existe, recibirás instrucciones para restablecer la contraseña'
    });

  } catch (error) {
    console.error('Error en forgotPassword:', error);
    return res.status(500).json({
      success: false,
      message: 'Ocurrió un error inesperado. Por favor intenta más tarde.'
    });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { password } = req.body;
    const { resetToken } = req.params;

    res.header('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGINS || '*');
    res.header('Access-Control-Allow-Methods', 'PUT');

    if (!password || password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'La contraseña debe tener al menos 8 caracteres'
      });
    }

    const resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'El token es inválido o ha expirado. Solicita uno nuevo.'
      });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    await sendEmail({
      email: user.email,
      subject: 'Tu contraseña ha sido actualizada',
      html: `<p>La contraseña de tu cuenta ha sido actualizada exitosamente.</p>`
    });

    return res.status(200).json({
      success: true,
      message: 'Contraseña actualizada exitosamente. Ya puedes iniciar sesión.'
    });

  } catch (error) {
    console.error('Error en resetPassword:', error);
    return res.status(500).json({
      success: false,
      message: 'Ocurrió un error al actualizar la contraseña. Intenta nuevamente.'
    });
  }
};
