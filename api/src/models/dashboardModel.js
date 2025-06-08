const db = require('../config/db');

// Lấy thông tin tổng quan Dashboard cho Admin
exports.getAdminDashboardData = async () => {
  return new Promise((resolve, reject) => {
    const dashboardData = {};

    db.query(
      `SELECT role, COUNT(*) AS total FROM Users GROUP BY role`,
      (err, results) => {
        if (err) return reject('Không thể lấy dữ liệu người dùng');
        dashboardData.totalUsers = results.reduce((acc, curr) => {
          acc[curr.role] = curr.total;
          return acc;
        }, {});

        db.query('SELECT COUNT(*) AS totalRooms FROM Rooms WHERE is_active = TRUE', (err, result) => {
          if (err) return reject('Không thể lấy dữ liệu phòng');
          dashboardData.totalRooms = result[0].totalRooms;

          db.query('SELECT COUNT(*) AS availableRooms FROM Rooms WHERE status = "Available" AND is_active = TRUE', (err, result) => {
            if (err) return reject('Không thể lấy dữ liệu phòng trống');
            dashboardData.availableRooms = result[0].availableRooms;

            db.query('SELECT COUNT(*) AS rentedRooms FROM Rooms WHERE status = "Rented" AND is_active = TRUE', (err, result) => {
              if (err) return reject('Không thể lấy dữ liệu phòng đã thuê');
              dashboardData.rentedRooms = result[0].rentedRooms;

              db.query(
                `SELECT SUM(total_amount) AS totalRevenue FROM Bills WHERE payment_status = 'Paid'`,
                (err, result) => {
                  if (err) return reject('Không thể lấy dữ liệu doanh thu');
                  dashboardData.totalRevenue = result[0].totalRevenue || 0;

                  db.query(
                    `SELECT status, COUNT(*) AS total FROM Contracts GROUP BY status`,
                    (err, result) => {
                      if (err) return reject('Không thể lấy dữ liệu hợp đồng');
                      dashboardData.totalContracts = result.reduce((acc, curr) => {
                        acc[curr.status] = curr.total;
                        return acc;
                      }, {});

                      db.query('SELECT COUNT(*) AS activeServices FROM Services WHERE is_active = TRUE', (err, result) => {
                        if (err) return reject('Không thể lấy dữ liệu dịch vụ');
                        dashboardData.activeServices = result[0].activeServices;
                        resolve(dashboardData);
                      });
                    }
                  );
                }
              );
            });
          });
        });
      }
    );
  });
};

// Doanh thu từng Landlord
exports.getLandlordRevenueData = async () => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT p.landlord_id, u.username AS landlord_name, 
             SUM(b.total_amount) AS totalRevenue
      FROM Properties p
      JOIN Rooms r ON p.property_id = r.property_id
      JOIN Contracts c ON r.room_id = c.room_id
      JOIN Bills b ON c.contract_id = b.contract_id
      JOIN Users u ON p.landlord_id = u.user_id
      WHERE b.payment_status = 'Paid' AND p.is_active = TRUE
      GROUP BY p.landlord_id`;

    db.query(query, (err, results) => {
      if (err) return reject('Không thể lấy dữ liệu doanh thu từng Landlord');
      resolve(results);
    });
  });
};

// Doanh thu theo ngày của Renter
exports.getRenterRevenueData = async () => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT c.renter_id, u.username AS renter_name, b.payment_date, 
             SUM(b.total_amount) AS totalRevenue
      FROM Contracts c
      JOIN Bills b ON c.contract_id = b.contract_id
      JOIN Users u ON c.renter_id = u.user_id
      WHERE b.payment_status = 'Paid'
      GROUP BY c.renter_id, b.payment_date
      ORDER BY b.payment_date ASC`;

    db.query(query, (err, results) => {
      if (err) return reject('Không thể lấy dữ liệu doanh thu của từng Renter');
      resolve(results);
    });
  });
};

// Dashboard cho Landlord
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
      SUM(b.electricity_amount) AS totalElectricity,
      SUM(b.water_amount) AS totalWater
    FROM Bills b
    JOIN Contracts c ON b.contract_id = c.contract_id
    JOIN Rooms r ON c.room_id = r.room_id
    JOIN Properties p ON r.property_id = p.property_id
    WHERE p.landlord_id = ?
      AND MONTH(b.payment_date) = MONTH(CURRENT_DATE())
      AND YEAR(b.payment_date) = YEAR(CURRENT_DATE())
      AND b.payment_status = 'Paid'
  `, [landlordId]);

  const [monthlyRevenue] = await db.promise().query(`
    SELECT 
      DATE_FORMAT(b.payment_date, '%Y-%m') as month,
      SUM(b.total_amount) AS revenue
    FROM Bills b
    JOIN Contracts c ON b.contract_id = c.contract_id
    JOIN Rooms r ON c.room_id = r.room_id
    JOIN Properties p ON r.property_id = p.property_id
    WHERE p.landlord_id = ? AND b.payment_status = 'Paid'
      AND b.payment_date >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
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
