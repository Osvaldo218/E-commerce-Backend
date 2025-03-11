const express = require("express");
const axios = require("axios");
require("dotenv").config();

const router = express.Router();

// Normaliza texto (convierte a minúsculas y quita tildes)
const normalizeText = (text) => {
    return text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
};

// Base de preguntas frecuentes sobre e-commerce
const faq = [
    { question: "como rastreo mi pedido", answer: "Puedes rastrear tu pedido en la sección 'Mis Pedidos'." },
    { question: "cuales son los metodos de pago", answer: "Aceptamos tarjeta de crédito, PayPal y Stripe." },
    { question: "cuanto tarda el envio", answer: "El envío tarda entre 3 y 7 días hábiles, dependiendo de tu ubicación." },
    { question: "puedo devolver un producto", answer: "Sí, tienes 30 días para devolver un producto. Consulta nuestra política de devoluciones." },
    { question: "como contacto con soporte", answer: "Puedes contactarnos por chat en vivo o al correo soporte@pointec.com." },
    { question: "mi pago no se proceso", answer: "Si tu pago no se procesó, verifica con tu banco o intenta otro método de pago." },
    { question: "que eres", answer: "Soy PointBot, una IA diseñada para ayudarte." },
    { question: "hola", answer: "Hola." }
];

// Ruta para el chatbot de soporte e-commerce
router.post("/chatbot", async (req, res) => {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: "Mensaje vacío." });

    const normalizedMessage = normalizeText(message);

    // Buscar coincidencia en el FAQ
    const faqMatch = faq.find((q) => normalizedMessage.includes(normalizeText(q.question)));
    if (faqMatch) {
        return res.json({ reply: faqMatch.answer });
    }

    try {
        const response = await axios.post(
            "https://api.openai.com/v1/chat/completions",
            {
                model: "gpt-4",
                messages: [
                    { role: "system", content: "Eres un asistente de soporte para una tienda en línea llamada Pointec. Ayuda a los clientes con dudas sobre pagos, envíos, devoluciones y el uso de la página web." },
                    { role: "user", content: message }
                ]
            },
            {
                headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` }
            }
        );

        return res.json({ reply: response.data.choices[0].message.content });

    } catch (error) {
        console.error("Error en el chatbot:", error.response?.data || error.message);

        const fallbackResponses = [
            "Lo siento, no puedo responder en este momento. Intenta de nuevo más tarde. 🤖",
            "Parece que tengo problemas para conectarme. ¿Podrías intentar otra pregunta? 😊",
            "Mi base de datos de respuestas está en mantenimiento, pero puedo aprender de ti. 🧠",
        ];

        return res.json({ reply: fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)] });
    }
});

module.exports = router;
