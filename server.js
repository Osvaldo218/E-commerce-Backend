const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const orderRoutes = require("./routes/orderRoutes");
const chatbotRoutes = require("./routes/chatbotRoutes");
const userRoutes = require("./routes/userRoutes");
const favoritesRoutes = require("./routes/favoritesRoutes");
const stripeRoutes = require("./routes/stripeRoutes");

dotenv.config();

const app = express();
const allowedOrigins = [
  'http://localhost:5173',
  'https://pointec-murex.vercel.app',
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('❌ No permitido por CORS'));
    }
  },
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
app.use("/api/orders", stripeRoutes);
app.use("/api/reports", require("./routes/reportRoutes"));
app.use("/api/checkout", require("./routes/checkoutRoutes"));
app.use("/api/cart", require("./routes/cartRoutes"));
app.use("/api/sales", require("./routes/salesRoutes"));
app.use("/api/favorites", favoritesRoutes);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
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
