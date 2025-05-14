const db = require('../config/db'); // Kết nối database

// Model để lấy dữ liệu tổng quan cho Dashboard
const getDashboardData = async () => {
  return new Promise((resolve, reject) => {
    const dashboardData = {};

    // Lấy tổng số người dùng
    db.query('SELECT COUNT(*) AS totalUsers FROM Users', (err, result) => {
      if (err) {
        reject('Không thể lấy dữ liệu người dùng');
        return;
      }
      dashboardData.totalUsers = result[0].totalUsers;

      // Lấy tổng số phòng
      db.query('SELECT COUNT(*) AS totalRooms FROM Rooms', (err, result) => {
        if (err) {
          reject('Không thể lấy dữ liệu phòng');
          return;
        }
        dashboardData.totalRooms = result[0].totalRooms;

        // Lấy số lượng phòng còn trống
        db.query('SELECT COUNT(*) AS availableRooms FROM Rooms WHERE status = "Available"', (err, result) => {
          if (err) {
            reject('Không thể lấy dữ liệu phòng trống');
            return;
          }
          dashboardData.availableRooms = result[0].availableRooms;

          // Lấy số lượng phòng đã thuê
          db.query('SELECT COUNT(*) AS rentedRooms FROM Rooms WHERE status = "Rented"', (err, result) => {
            if (err) {
              reject('Không thể lấy dữ liệu phòng đã thuê');
              return;
            }
            dashboardData.rentedRooms = result[0].rentedRooms;

            resolve(dashboardData);
          });
        });
      });
    });
  });
};

module.exports = { getDashboardData };
