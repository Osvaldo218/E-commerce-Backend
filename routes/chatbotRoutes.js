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
        { question: "como hago un pedido", answer: "Selecciona los productos que deseas, agrégalos al carrito y sigue los pasos del checkout." },
        { question: "cuanto tarda el envio", answer: "El envío tarda entre 3 y 7 días hábiles, dependiendo de tu ubicación." },
        { question: "puedo modificar mi pedido", answer: "Solo puedes modificar tu pedido antes de que sea enviado. Contáctanos lo antes posible." },
        { question: "hacen envios internacionales", answer: "Sí, realizamos envíos internacionales a ciertos países. Consulta nuestra política de envíos." },
        { question: "que pasa si mi pedido no llega", answer: "Si tu pedido no ha llegado en el tiempo estimado, contáctanos para resolverlo." },
        { question: "puedo recoger mi pedido en tienda", answer: "Sí, ofrecemos la opción de recogida en tienda en ciertas ubicaciones." },
    
        // 💳 PAGOS Y FACTURACIÓN
        { question: "cuales son los metodos de pago", answer: "Aceptamos tarjetas de crédito/débito, PayPal y Stripe." },
        { question: "puedo pagar en efectivo", answer: "Por el momento, solo aceptamos pagos digitales." },
        { question: "como obtengo mi factura", answer: "Puedes solicitar tu factura al finalizar la compra o desde la sección 'Mis Compras'." },
        { question: "por que mi tarjeta fue rechazada", answer: "Verifica que los datos sean correctos o intenta con otro método de pago." },
    
        // 🎁 DESCUENTOS Y PROMOCIONES
        { question: "tienen descuentos disponibles", answer: "Sí, revisa nuestra página de promociones o suscríbete a nuestro boletín." },
        { question: "como uso un cupon de descuento", answer: "Ingresa el código del cupón en el checkout antes de completar tu compra." },
        { question: "puedo combinar varias promociones", answer: "No, solo se puede usar un cupón de descuento por compra." },
    
        // 🏬 PRODUCTOS Y DISPONIBILIDAD
        { question: "como saber si un producto esta en stock", answer: "Cada producto muestra su disponibilidad en la página de compra." },
        { question: "los productos tienen garantia", answer: "Sí, ofrecemos garantía en la mayoría de los productos. Consulta la descripción del artículo." },
        { question: "como elijo la talla correcta", answer: "Consulta nuestra guía de tallas disponible en la página de cada producto." },
    
        // 📦 DEVOLUCIONES Y REEMBOLSOS
        { question: "puedo devolver un producto", answer: "Sí, tienes 30 días para devolver un producto. Consulta nuestra política de devoluciones." },
        { question: "como solicito un reembolso", answer: "Puedes solicitar un reembolso desde la sección 'Mis Pedidos' o contactando a soporte." },
        { question: "cuanto tarda un reembolso", answer: "Los reembolsos pueden tardar entre 5 y 10 días hábiles en procesarse." },
    
        // 👤 CUENTAS Y SEGURIDAD
        { question: "como creo una cuenta", answer: "Haz clic en 'Pointec', despues haz click en 'Regítrate' y completa el formulario con tu información." },
        { question: "olvide mi contraseña", answer: "Puedes restablecer tu contraseña en la página de inicio de sesión, haciendo clic en '¿Olvidaste tu contraseña?'." },
        { question: "como cambio mi direccion de correo", answer: "Puedes actualizar tu correo en la configuración de tu cuenta." },
        { question: "es seguro comprar en su sitio", answer: "Sí, usamos cifrado SSL y métodos de pago seguros como Stripe y PayPal." },
    
        // 🔧 SOPORTE TÉCNICO
        { question: "como contacto con soporte", answer: "Puedes contactarnos por chat en vivo o al correo soporte@pointec.com." },
        { question: "tienen atencion telefonica", answer: "Sí, puedes llamarnos al +123 456 7890 en horario laboral." },
        { question: "puedo cancelar un pedido", answer: "Sí, puedes cancelar un pedido antes de que sea enviado desde 'Mis Pedidos'." },
    
        // 📡 INFORMACIÓN TÉCNICA Y PLATAFORMA
        { question: "puedo comprar desde mi celular", answer: "Sí, nuestra tienda está optimizada para dispositivos móviles." },
        { question: "donde veo mi historial de compras", answer: "Tu historial de compras está disponible en la sección 'Mis Pedidos'." },
    
        // 🤖 INTERACCIÓN CON EL CHATBOT
        { question: "que puedes hacer", answer: "Puedo responder preguntas sobre nuestra tienda, pedidos y más." },
        { question: "quien te creo", answer: "Fui desarrollado por el equipo de Pointec para mejorar tu experiencia de compra." },
        { question: "puedes recomendarme un producto", answer: "Claro, dime qué buscas y te sugeriré opciones." },
        { question: "me puedes mostrar mis pedidos anteriores", answer: "Sí, ve a 'Mis Pedidos' en tu cuenta para verlos." },
        { question: "puedes notificarme sobre ofertas", answer: "Sí, suscríbete a nuestro boletín para recibir promociones." },
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
