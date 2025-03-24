const nodemailer = require("nodemailer");

const sendEmail = async ({ email, subject, message, htmlMessage }) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: `"Pointec Soporte" <${process.env.EMAIL_USER}>`,
      to: email,
      subject,
      text: message,
      html: htmlMessage || `<p>${message}</p>` // Permite enviar HTML si se proporciona
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Correo enviado: ${info.response}`);

  } catch (error) {
    console.error("❌ Error al enviar email:", error);
    throw new Error("No se pudo enviar el correo.");
  }
};

module.exports = sendEmail;
