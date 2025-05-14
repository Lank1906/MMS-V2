const dashboardModel = require('../models/dashboardModel');

// Controller để lấy dữ liệu tổng quan cho Dashboard
exports.getDashboard = async (req, res) => {
  try {
    const dashboardData = await dashboardModel.getDashboardData();
    res.status(200).json(dashboardData); // Trả dữ liệu về cho client
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
