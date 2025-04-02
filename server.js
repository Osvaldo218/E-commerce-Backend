const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const orderRoutes = require("./routes/orderRoutes");
const chatbotRoutes = require("./routes/chatbotRoutes");
const userRoutes = require("./routes/userRoutes");

dotenv.config();

const app = express();
app.use(cors({
  origin: ['http://localhost:5173', 'https://pointec-murex.vercel.app'],
  methods: 'GET, POST, PUT, DELETE',
  credentials: true,
}));

app.use(express.json());

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB conectado"))
  .catch(err => console.log("❌ Error conectando a MongoDB:", err));

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/payments', paymentRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/reports", require("./routes/reportRoutes"));
app.use("/api/checkout", require("./routes/checkoutRoutes"));
app.use("/api/cart", require("./routes/cartRoutes"));
app.use("/api/sales", require("./routes/salesRoutes"));
app.use("/api/users", userRoutes);
app.use("/api", chatbotRoutes);

const PORT = process.env.PORT || 5000;
const BACKEND_URL = process.env.BACKEND_URL || `http://localhost:${PORT}`;

app.listen(PORT, () => {
  console.log(`✅ Backend corriendo en: ${BACKEND_URL}`);
  console.log(`🌐 Conectado al frontend en: ${process.env.FRONTEND_URL}`);
});

app.get('/health', (req, res) => {
  res.status(200).json({ message: "Server is healthy" });
});
