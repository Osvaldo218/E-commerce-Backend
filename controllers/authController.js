const User = require('../models/User');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');
const validator = require('validator');

// Configuración
const RESET_TOKEN_EXPIRATION = 3600000; // 1 hora en ms
const FRONTEND_RESET_URL = process.env.FRONTEND_RESET_URL || 'https://pointec-murex.vercel.app/reset-password';

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    // Validar CORS primero
    res.header('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGINS || '*');
    res.header('Access-Control-Allow-Methods', 'POST');
    
    const { email } = req.body;

    // Validación robusta del email
    if (!email || !validator.isEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Por favor proporciona un email válido'
      });
    }

    // Buscar usuario sin revelar si existe o no
    const user = await User.findOne({ email });
    if (!user) {
      // Por seguridad, damos la misma respuesta
      return res.status(200).json({
        success: true,
        message: 'Si este email existe en nuestro sistema, recibirás un correo con instrucciones'
      });
    }

    // Generar token seguro
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Guardar token con expiración
    user.resetPasswordToken = resetPasswordToken;
    user.resetPasswordExpire = Date.now() + RESET_TOKEN_EXPIRATION;
    await user.save({ validateBeforeSave: false });

    // Crear URL segura para el frontend
    const resetUrl = `${FRONTEND_RESET_URL}?token=${resetToken}`;

    // Plantilla de email más profesional
    const message = `
      <h2>Solicitud de restablecimiento de contraseña</h2>
      <p>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta.</p>
      <p>Por favor haz clic en el siguiente enlace para continuar:</p>
      <a href="${resetUrl}" target="_blank">Restablecer contraseña</a>
      <p>Este enlace expirará en 1 hora.</p>
      <p>Si no solicitaste este cambio, por favor ignora este mensaje.</p>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Instrucciones para restablecer tu contraseña',
        html: message // Usamos HTML en lugar de texto plano
      });

      return res.status(200).json({
        success: true,
        message: 'Si este email existe en nuestro sistema, recibirás un correo con instrucciones'
      });

    } catch (error) {
      // Revertir cambios si falla el email
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });

      console.error('Error enviando email:', error);
      return res.status(500).json({
        success: false,
        message: 'Ocurrió un error al enviar el email. Por favor intenta nuevamente.'
      });
    }

  } catch (error) {
    console.error('Error en forgotPassword:', error);
    return res.status(500).json({
      success: false,
      message: 'Ocurrió un error inesperado. Por favor intenta más tarde.'
    });
  }
};

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:resetToken
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    const { password } = req.body;
    const { resetToken } = req.params;

    // Validar CORS
    res.header('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGINS || '*');
    res.header('Access-Control-Allow-Methods', 'PUT');

    // Validar contraseña (deberías usar un validador más robusto)
    if (!password || password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'La contraseña debe tener al menos 8 caracteres'
      });
    }

    // Hash el token para comparar
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Buscar usuario con token válido y no expirado
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'El token es inválido o ha expirado. Por favor solicita un nuevo enlace.'
      });
    }

    // Actualizar contraseña y limpiar token
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    
    // Forzar validación al guardar
    await user.save();

    // Opcional: Enviar email de confirmación
    await sendEmail({
      email: user.email,
      subject: 'Tu contraseña ha sido actualizada',
      html: `<p>La contraseña de tu cuenta ha sido actualizada exitosamente.</p>`
    });

    return res.status(200).json({
      success: true,
      message: 'Contraseña actualizada exitosamente. Ahora puedes iniciar sesión con tu nueva contraseña.'
    });

  } catch (error) {
    console.error('Error en resetPassword:', error);
    
    // Manejar errores de validación de Mongoose
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'La contraseña no cumple con los requisitos mínimos'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Ocurrió un error al actualizar la contraseña. Por favor intenta nuevamente.'
    });
  }
};