const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // 1. Crear transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD
    }
  });

  // 2. Definir opciones del email
  const mailOptions = {
    from: 'Tu E-commerce <noreply@tuecommerce.com>',
    to: options.email,
    subject: options.subject,
    text: options.message
    // html: options.html (opcional para emails con formato)
  };

  // 3. Enviar email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;