const db = require('../config/db');

// Lấy danh sách dịch vụ
exports.getServices = (callback) => {
  const sql = 'SELECT * FROM Services WHERE is_active = TRUE ORDER BY service_id DESC';
  db.query(sql, (err, results) => {
    if (err) return callback(err);
    callback(null, results);
  });
};

// Lấy chi tiết dịch vụ theo ID
exports.getServiceById = (id, callback) => {
  const sql = 'SELECT * FROM Services WHERE service_id = ? AND is_active = TRUE';
  db.query(sql, [id], (err, results) => {
    if (err) return callback(err);
    callback(null, results[0]);
  });
};

// Thêm dịch vụ mới
exports.createService = (data, callback) => {
  const sql = 'INSERT INTO Services (service_name, service_description, service_price, is_active) VALUES (?, ?, ?, TRUE)';
  db.query(sql, [data.service_name, data.service_description, data.service_price], (err, result) => {
    if (err) return callback(err);
    callback(null, result);
  });
};

// Cập nhật dịch vụ
exports.updateService = (id, data, callback) => {
  const sql = `
    UPDATE Services
    SET service_name = ?, service_description = ?, service_price = ?
    WHERE service_id = ? AND is_active = TRUE
  `;
  db.query(sql, [data.service_name, data.service_description, data.service_price, id], (err, result) => {
    if (err) return callback(err);
    callback(null, result);
  });
};

// Xóa dịch vụ (update is_active = false)
exports.deleteService = (id, callback) => {
  const sql = 'UPDATE Services SET is_active = FALSE WHERE service_id = ?';
  db.query(sql, [id], (err, result) => {
    if (err) return callback(err);
    callback(null, result);
  });
};
