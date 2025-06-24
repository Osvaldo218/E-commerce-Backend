const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["admin", "vendedor", "cliente"],
    default: "cliente"
  },
  verified: { type: Boolean, default: false },

  // 📩 Verificación de correo electrónico
  verificationCode: String,
  verificationExpires: Date,

  // 🔐 Recuperación de contraseña
  resetPasswordToken: String,
  resetPasswordExpire: Date,

  // 📦 NUEVO: Direcciones guardadas por el usuario
  addresses: {
    type: [String],
    default: [],
  }
}, { timestamps: true });

// 📌 Hashear contraseña antes de guardar
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// 📌 Método para comparar contraseñas
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// 📌 Generar un token de recuperación
UserSchema.methods.generateResetToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");

  this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutos

  return resetToken;
};

module.exports = mongoose.model("User", UserSchema);
