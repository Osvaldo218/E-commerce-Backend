const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const orderRoutes = require("./routes/orderRoutes");
const chatbotRoutes = require("./routes/chatbotRoutes");

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("MongoDB conectado"))
.catch(err => console.log(err));

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/payments', paymentRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/reports", require("./routes/reportRoutes"));
app.use("/api/checkout", require("./routes/checkoutRoutes"));
app.use("/api/cart", require("./routes/cartRoutes"));
app.use("/api", chatbotRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));