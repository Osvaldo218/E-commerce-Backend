const Order = require("../models/Order"); // Modelo de pedidos

exports.getSalesStats = async (req, res) => {
  try {
    const salesData = await Order.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } }, // Agrupar por mes
          totalSales: { $sum: "$totalAmount" },
          totalOrders: { $sum: 1 },
          deliveryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
        },
      },
      { $sort: { _id: 1 } }, // Ordenar cronológicamente
    ]);

    res.json(salesData);
  } catch (error) {
    res.status(500).json({ message: "Error obteniendo estadísticas" });
  }
};
