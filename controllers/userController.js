const User = require("../models/User.js");

const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    res.json(user);
  } catch (error) {
    console.error("Error al obtener perfil:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
};
  
// 📌 Actualizar usuario por ID
const updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, email, role } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { name, email, role },
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }

    res.json({ message: "Usuario actualizado correctamente", updatedUser });
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// 📌 Eliminar usuario por ID
const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }

    res.json({ message: "Usuario eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

const getUserAddresses = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "Usuario no encontrado." });

    res.json({ addresses: user.addresses || [] });
  } catch (error) {
    console.error("Error al obtener direcciones:", error);
    res.status(500).json({ message: "Error al obtener direcciones" });
  }
};

const addUserAddress = async (req, res) => {
  try {
    const { address } = req.body;
    if (!address || address.trim() === "") {
      return res.status(400).json({ message: "La dirección es obligatoria" });
    }

    const user = await User.findById(req.user.id);
    user.addresses.push(address);
    await user.save();

    res.status(201).json({ message: "Dirección guardada correctamente", addresses: user.addresses });
  } catch (error) {
    console.error("Error al guardar dirección:", error);
    res.status(500).json({ message: "Error al guardar dirección" });
  }
};

const deleteUserAddress = async (req, res) => {
  try {
    const { address } = req.body;
    const user = await User.findById(req.user.id);
    user.addresses = user.addresses.filter((a) => a !== address);
    await user.save();

    res.json({ message: "Dirección eliminada", addresses: user.addresses });
  } catch (error) {
    console.error("Error al eliminar dirección:", error);
    res.status(500).json({ message: "Error al eliminar dirección" });
  }
};

module.exports = { getUserProfile, getAllUsers, updateUser, deleteUser, 
  getUserAddresses, addUserAddress, deleteUserAddress, };
