const Order = require("../models/Order.js");

// 📌 Crear una orden
const createOrder = async (req, res) => {
  try {
    const { userId, items, totalPrice } = req.body;

    // Validar datos de entrada
    if (!userId || !items || items.length === 0 || !Number.isFinite(totalPrice)) {
      return res.status(400).json({ message: "Faltan datos o hay valores inválidos en la orden" });
    }

    const newOrder = new Order({
      user: userId,
      items,
      totalPrice,
      orderStatus: "Pendiente", // Estado inicial
      createdAt: new Date(),
      statusHistory: [{ status: "Pendiente", date: new Date() }],
    });

    await newOrder.save();
    res.status(201).json({ message: "Orden creada exitosamente", order: newOrder });
  } catch (error) {
    console.error("Error al crear la orden:", error);
    res.status(500).json({ message: "Error interno al crear la orden", error });
  }
};

// 📌 Obtener órdenes de un usuario
const getUserOrders = async (req, res) => {
  try {
    const userId = req.params.userId;
    const orders = await Order.find({ user: userId }).populate("items.product");

    if (!orders.length) {
      return res.status(404).json({ message: "No se encontraron órdenes para este usuario" });
    }

    res.json(orders);
  } catch (error) {
    console.error("Error al obtener órdenes:", error);
    res.status(500).json({ message: "Error interno al obtener órdenes", error });
  }
};

// 📌 Actualizar el estado de una orden (Admin/Vendedor)
const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const orderStatus = req.body.orderStatus?.trim().toLowerCase();

    // Validar que se envió un estado válido
    const validStatuses = ["pendiente", "enviado", "entregado", "cancelado"];
    if (!validStatuses.includes(orderStatus)) {
      return res.status(400).json({ message: "Estado de orden no válido" });
    }

    // Convertir a formato capitalizado ("Pendiente", "Enviado", etc.)
    const formattedStatus = orderStatus.charAt(0).toUpperCase() + orderStatus.slice(1);

    // Actualizar el estado de la orden y agregar al historial
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      {
        orderStatus: formattedStatus,
        $push: { statusHistory: { status: formattedStatus, date: new Date() } },
      },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: "Orden no encontrada" });
    }

    res.json({ message: "Estado de orden actualizado", order: updatedOrder });
  } catch (error) {
    console.error("Error al actualizar orden:", error);
    res.status(500).json({ message: "Error interno al actualizar la orden", error });
  }
};

// Exportar funciones (CommonJS)
module.exports = { createOrder, getUserOrders, updateOrderStatus };
