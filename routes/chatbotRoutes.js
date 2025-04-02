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
    // 🛒 PEDIDOS Y ENVÍOS
    { question: "como rastreo mi pedido", answer: "Puedes rastrear tu pedido en la sección 'Mis Pedidos' ingresando el número de orden." },
    { question: "cuanto tarda el envio", answer: "El envío tarda entre 3 y 7 días hábiles, dependiendo de tu ubicación." },
    { question: "puedo cambiar la direccion de envio", answer: "Sí, puedes cambiar la dirección antes de que el pedido sea enviado. Contáctanos lo antes posible." },

    // 💳 PAGOS
    { question: "cuales son los metodos de pago", answer: "Aceptamos tarjetas de crédito/débito, PayPal y Stripe." },
    { question: "mi pago no se proceso", answer: "Si tu pago no se procesó, verifica con tu banco o intenta otro método de pago." },
    { question: "es seguro pagar en su sitio", answer: "Sí, nuestro sitio usa cifrado SSL y procesamos pagos a través de plataformas seguras como Stripe y PayPal." },

    // 🎁 DESCUENTOS Y PROMOCIONES
    { question: "tienen descuentos disponibles", answer: "Sí, revisa nuestra página de promociones o suscríbete a nuestro boletín para recibir ofertas exclusivas." },
    { question: "como uso un cupon de descuento", answer: "Ingresa el código del cupón en el checkout antes de completar tu compra." },

    // 🏬 PRODUCTOS Y STOCK
    { question: "como saber si un producto esta en stock", answer: "Cada producto muestra su disponibilidad en la página de compra." },
    { question: "puedo reservar un producto agotado", answer: "Sí, puedes hacer una reserva y te notificaremos cuando esté disponible." },
    { question: "pueden personalizar productos", answer: "Algunos productos permiten personalización. Consulta la descripción para más detalles." },

    // 📦 DEVOLUCIONES Y REEMBOLSOS
    { question: "puedo devolver un producto", answer: "Sí, tienes 30 días para devolver un producto. Consulta nuestra política de devoluciones." },
    { question: "como solicito un reembolso", answer: "Puedes solicitar un reembolso desde la sección 'Mis Pedidos' o contactando a soporte." },
    { question: "cuanto tarda un reembolso", answer: "Los reembolsos pueden tardar entre 5 y 10 días hábiles en procesarse." },

    // 👤 CUENTAS Y SEGURIDAD
    { question: "como creo una cuenta", answer: "Haz clic en 'Registrarse' y completa el formulario con tu información." },
    { question: "olvide mi contraseña", answer: "Puedes restablecer tu contraseña en la página de inicio de sesión, haciendo clic en '¿Olvidaste tu contraseña?'." },
    { question: "como cambio mi direccion de correo", answer: "Puedes actualizar tu correo en la configuración de tu cuenta." },

    // 🔧 SOPORTE TÉCNICO
    { question: "como contacto con soporte", answer: "Puedes contactarnos por chat en vivo o al correo soporte@pointec.com." },
    { question: "tienen atencion telefonica", answer: "Sí, puedes llamarnos al +123 456 7890 en horario laboral." },
    { question: "puedo cancelar un pedido", answer: "Sí, puedes cancelar un pedido antes de que sea enviado. Visita 'Mis Pedidos' para hacerlo." },
    { question: "como creo un usuario", answer: "Haz clic en 'Pointec' en la parte superior de la página, posteriormente haz click en 'Regístrate' y completa el formulario con tu nombre, correo y contraseña." },

    // 🤖 INTERACCIÓN GENERAL
    { question: "que eres", answer: "Soy PointBot, una IA diseñada para ayudarte con tus dudas sobre nuestra tienda." },
    { question: "hola", answer: "¡Hola! ¿En qué puedo ayudarte hoy?" },
    { question: "gracias", answer: "¡De nada! 😊 Si necesitas más ayuda, aquí estaré." }
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
