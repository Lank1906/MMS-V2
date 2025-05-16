const db = require('../config/db');

// Lấy danh sách properties với phân trang và tìm kiếm theo tên
exports.getProperties = (landlordId, page, limit, search, callback) => {
  const offset = (page - 1) * limit;
  const sql = `
    SELECT * FROM Properties 
    WHERE landlord_id = ? AND name LIKE ? AND is_active = TRUE
    ORDER BY property_id DESC
    LIMIT ? OFFSET ?
  `;
  db.query(sql, [landlordId, `%${search}%`, limit, offset], (err, results) => {
    if (err) return callback(err);
    // Lấy tổng số để phân trang
    db.query('SELECT COUNT(*) AS total FROM Properties WHERE landlord_id = ? AND name LIKE ? AND is_active = TRUE', [landlordId, `%${search}%`], (err2, countResult) => {
      if (err2) return callback(err2);
      callback(null, { properties: results, total: countResult[0].total });
    });
  });
};

// Lấy chi tiết 1 cụm theo id
exports.getPropertyById = (id, landlordId, callback) => {
  const sql = 'SELECT * FROM Properties WHERE property_id = ? AND landlord_id = ? AND is_active = TRUE';
  db.query(sql, [id, landlordId], (err, results) => {
    if (err) return callback(err);
    callback(null, results[0]);
  });
};

// Thêm cụm nhà trọ mới
exports.createProperty = (landlordId, data, callback) => {
  const sql = 'INSERT INTO Properties (landlord_id, name, address, contact_phone, is_active) VALUES (?, ?, ?, ?, TRUE)';
  db.query(sql, [landlordId, data.name, data.address, data.contact_phone], (err, result) => {
    if (err) return callback(err);
    callback(null, result);
  });
};

// Cập nhật cụm nhà trọ
exports.updateProperty = (id, landlordId, data, callback) => {
  const sql = `
    UPDATE Properties 
    SET name = ?, address = ?, contact_phone = ?
    WHERE property_id = ? AND landlord_id = ? AND is_active = TRUE
  `;
  db.query(sql, [data.name, data.address, data.contact_phone, id, landlordId], (err, result) => {
    if (err) return callback(err);
    callback(null, result);
  });
};

// Xóa cụm nhà trọ (cập nhật is_active = FALSE)
exports.deleteProperty = (id, landlordId, callback) => {
  const sql = 'UPDATE Properties SET is_active = FALSE WHERE property_id = ? AND landlord_id = ?';
  db.query(sql, [id, landlordId], (err, result) => {
    if (err) return callback(err);
    callback(null, result);
  });
};
