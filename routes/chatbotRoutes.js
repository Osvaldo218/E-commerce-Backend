const express = require("express");
const axios = require("axios");

const router = express.Router();
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

router.post("/chatbot", async (req, res) => {
    try {
        const { message } = req.body;

        const response = await axios.post("https://api.openai.com/v1/chat/completions", {
            model: "gpt-4",
            messages: [{ role: "system", content: "Eres un asistente de soporte para una tienda online." }, { role: "user", content: message }]
        }, {
            headers: { Authorization: `Bearer ${OPENAI_API_KEY}` }
        });

        res.json({ reply: response.data.choices[0].message.content });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
