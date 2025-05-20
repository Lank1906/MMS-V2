const db = require('../config/db');  // Đảm bảo kết nối với MySQL

// Lấy thông tin tổng quan Dashboard cho Admin
exports.getAdminDashboardData = async () => {
  return new Promise((resolve, reject) => {
    const dashboardData = {};

    // Lấy tổng số người dùng theo role
    db.query(
      `SELECT role, COUNT(*) AS total FROM Users GROUP BY role`,
      (err, results) => {
        if (err) {
          reject('Không thể lấy dữ liệu người dùng');
          return;
        }
        // Map kết quả trả về theo role
        dashboardData.totalUsers = results.reduce((acc, curr) => {
          acc[curr.role] = curr.total;
          return acc;
        }, {});
      }
    );

    // Lấy tổng số phòng
    db.query('SELECT COUNT(*) AS totalRooms FROM Rooms WHERE is_active = TRUE', (err, result) => {
      if (err) {
        reject('Không thể lấy dữ liệu phòng');
        return;
      }
      dashboardData.totalRooms = result[0].totalRooms;
    });

    // Lấy số phòng trống
    db.query('SELECT COUNT(*) AS availableRooms FROM Rooms WHERE status = "Available" AND is_active = TRUE', (err, result) => {
      if (err) {
        reject('Không thể lấy dữ liệu phòng trống');
        return;
      }
      dashboardData.availableRooms = result[0].availableRooms;
    });

    // Lấy số phòng đã thuê
    db.query('SELECT COUNT(*) AS rentedRooms FROM Rooms WHERE status = "Rented" AND is_active = TRUE', (err, result) => {
      if (err) {
        reject('Không thể lấy dữ liệu phòng đã thuê');
        return;
      }
      dashboardData.rentedRooms = result[0].rentedRooms;
    });

    // Lấy tổng doanh thu
    db.query(
      `SELECT SUM(c.rent_price + c.total_water_price + c.total_electricity_price + c.total_service_price) AS totalRevenue 
       FROM Contracts c WHERE c.payment_status = 'Paid'`,
      (err, result) => {
        if (err) {
          reject('Không thể lấy dữ liệu doanh thu');
          return;
        }
        dashboardData.totalRevenue = result[0].totalRevenue || 0;
      }
    );

    // Lấy tổng hợp đồng (Active, Completed, Terminated)
    db.query(
      `SELECT status, COUNT(*) AS total FROM Contracts GROUP BY status`,
      (err, result) => {
        if (err) {
          reject('Không thể lấy dữ liệu hợp đồng');
          return;
        }
        dashboardData.totalContracts = result.reduce((acc, curr) => {
          acc[curr.status] = curr.total;
          return acc;
        }, {});
      }
    );

    // Lấy dịch vụ đang hoạt động
    db.query('SELECT COUNT(*) AS activeServices FROM Services WHERE is_active = TRUE', (err, result) => {
      if (err) {
        reject('Không thể lấy dữ liệu dịch vụ');
        return;
      }
      dashboardData.activeServices = result[0].activeServices;
      resolve(dashboardData);  // Trả về toàn bộ dữ liệu thống kê
    });
  });
};

// Lấy doanh thu của từng Landlord
exports.getLandlordRevenueData = async () => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT p.landlord_id, u.username AS landlord_name, 
             SUM(c.rent_price + c.total_water_price + c.total_electricity_price + c.total_service_price) AS totalRevenue
      FROM Properties p
      JOIN Rooms r ON p.property_id = r.property_id
      JOIN Contracts c ON r.room_id = c.room_id
      JOIN Users u ON p.landlord_id = u.user_id
      WHERE c.payment_status = 'Paid' AND p.is_active = TRUE
      GROUP BY p.landlord_id`;

    db.query(query, (err, results) => {
      if (err) {
        reject('Không thể lấy dữ liệu doanh thu từng Landlord');
        return;
      }
      resolve(results);  // Trả về dữ liệu doanh thu của từng Landlord
    });
  });
};

// Lấy doanh thu theo ngày cho từng Renter
exports.getRenterRevenueData = async () => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT c.renter_id, u.username AS renter_name, c.payment_date, 
             SUM(c.rent_price + c.total_water_price + c.total_electricity_price + c.total_service_price) AS totalRevenue
      FROM Contracts c
      JOIN Users u ON c.renter_id = u.user_id
      WHERE c.payment_status = 'Paid'
      GROUP BY c.renter_id, c.payment_date
      ORDER BY c.payment_date ASC`;

    db.query(query, (err, results) => {
      if (err) {
        reject('Không thể lấy dữ liệu doanh thu của từng Renter');
        return;
      }
      resolve(results);  // Trả về doanh thu của từng Renter
    });
  });
};

exports.getLandlordDashboardData = async (landlordId) => {
  const [rooms] = await db.promise().query(`
    SELECT status FROM Rooms
    WHERE property_id IN (
      SELECT property_id FROM Properties WHERE landlord_id = ?
    )
  `, [landlordId]);

  const [renterCount] = await db.promise().query(`
    SELECT COUNT(*) as total FROM Room_Renters rr
    JOIN Rooms r ON rr.room_id = r.room_id
    JOIN Properties p ON r.property_id = p.property_id
    WHERE rr.status = 'Active' AND p.landlord_id = ?
  `, [landlordId]);

  const [utilitySum] = await db.promise().query(`
    SELECT 
      SUM(r.current_electricity_usage * rt.electricity_price) AS totalElectricity,
      SUM(r.current_water_usage * rt.water_price) AS totalWater
    FROM Rooms r
    JOIN RoomTypes rt ON r.room_type_id = rt.room_type_id
    JOIN Properties p ON r.property_id = p.property_id
    WHERE p.landlord_id = ?
  `, [landlordId]);

  const [monthlyRevenue] = await db.promise().query(`
    SELECT 
      DATE_FORMAT(c.payment_date, '%Y-%m') as month,
      SUM(c.rent_price + c.total_water_price + c.total_electricity_price + c.total_service_price) AS revenue
    FROM Contracts c
    JOIN Rooms r ON c.room_id = r.room_id
    JOIN Properties p ON r.property_id = p.property_id
    WHERE p.landlord_id = ? AND c.payment_status = 'Paid'
      AND c.payment_date >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
    GROUP BY month
    ORDER BY month ASC
  `, [landlordId]);

  const totalRooms = rooms.length;
  const rentedRooms = rooms.filter(r => r.status === 'Rented').length;
  const availableRooms = totalRooms - rentedRooms;

  return {
    rentedRooms,
    availableRooms,
    renterCount: renterCount[0].total,
    totalElectricity: utilitySum[0].totalElectricity || 0,
    totalWater: utilitySum[0].totalWater || 0,
    monthlyRevenue
  };
};
