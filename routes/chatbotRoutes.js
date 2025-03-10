const express = require("express");
const axios = require("axios");
require("dotenv").config();

const router = express.Router();

const faq = [
    { question: "¿Cómo rastreo mi pedido?", answer: "Puedes rastrear tu pedido en la sección 'Mis Pedidos'." },
    { question: "¿Cuáles son los métodos de pago?", answer: "Aceptamos tarjeta de crédito, PayPal y Stripe." },
    { question: "¿Qué soy?", answer: "Pendejo." }
];

router.post("/chatbot", async (req, res) => {
    const { message } = req.body;
    const faqMatch = faq.find((q) => message.toLowerCase().includes(q.question.toLowerCase()));

    if (faqMatch) {
        return res.json({ reply: faqMatch.answer });
    }

    try {
        const response = await axios.post(
            "https://api.openai.com/v1/chat/completions",
            {
                model: "gpt-4",
                messages: [
                    { role: "system", content: "Eres un asistente de soporte." },
                    { role: "user", content: message }
                ]
            },
            {
                headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` }
            }
        );

        res.json({ reply: response.data.choices[0].message.content });
    } catch (error) {
        res.status(500).json({ error: "Error en el chatbot" });
    }
});

module.exports = router;
