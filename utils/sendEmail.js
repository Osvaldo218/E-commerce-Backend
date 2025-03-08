const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, text) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,  // Agrega tu correo en .env
            pass: process.env.EMAIL_PASS,  // Usa una contraseña de aplicación de Gmail
        },
    });

    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to,
        subject,
        text,
    });
};

module.exports = sendEmail;
