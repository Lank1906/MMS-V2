const dashboardModel = require('../models/dashboardModel');

// Controller để lấy dữ liệu tổng quan cho Dashboard
exports.getDashboard = async (req, res) => {
  try {
    let dashboardData = {};

    if (req.user.role === 'Admin') {
      dashboardData = await dashboardModel.getAdminDashboardData();
    } else if (req.user.role === 'Landlord') {
      dashboardData = await dashboardModel.getLandlordDashboardData(req.user.user_id);
    }

    res.status(200).json({ role: req.user.role, data: dashboardData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Controller để lấy doanh thu theo từng Landlord
exports.getLandlordRevenue = async (req, res) => {
  try {
    const landlordRevenue = await dashboardModel.getLandlordRevenueData();
    res.status(200).json({ data: landlordRevenue });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Controller để lấy doanh thu theo ngày cho từng Renter
exports.getRenterRevenue = async (req, res) => {
    console.log('renterRevenue')
  try {
    const renterRevenue = await dashboardModel.getRenterRevenueData();
    
    res.status(200).json({ data: renterRevenue });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
