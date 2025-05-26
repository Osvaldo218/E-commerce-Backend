const nodemailer = require('nodemailer');

const verifyEmail = async ({ email, subject, html }) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'Gmail', // o el servicio que estés utilizando
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USERNAME,
      to: email,
      subject,
      html,
    });

    console.log('Correo de verificación enviado exitosamente');
  } catch (error) {
    console.error('Error al enviar el correo de verificación:', error);
    throw new Error('No se pudo enviar el correo de verificación');
  }
};

module.exports = verifyEmail;
