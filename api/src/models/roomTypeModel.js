const db = require('../config/db');

// Lấy danh sách loại phòng có phân trang và tìm kiếm
exports.getRoomTypes = (id,page, limit, search, callback) => {
  const offset = (page - 1) * limit;
  const sql = `
    SELECT * FROM RoomTypes
    WHERE landlord_id=? and name LIKE ? AND is_active = TRUE
    ORDER BY room_type_id DESC
    LIMIT ? OFFSET ?
  `;
  db.query(sql, [id,`%${search}%`, limit, offset], (err, results) => {
    if (err) return callback(err);
    db.query(
      'SELECT COUNT(*) AS total FROM RoomTypes WHERE landlord_id=? and name LIKE ? AND is_active = TRUE',
      [id,`%${search}%`],
      (err2, countResult) => {
        if (err2) return callback(err2);
        callback(null, { roomTypes: results, total: countResult[0].total });
      }
    );
  });
};

// Lấy chi tiết loại phòng theo id
exports.getRoomTypeById = (id, callback) => {
  const sql = 'SELECT * FROM RoomTypes WHERE room_type_id = ? AND is_active = TRUE';
  db.query(sql, [id], (err, results) => {
    if (err) return callback(err);
    callback(null, results[0]);
  });
};

// Thêm loại phòng mới
exports.createRoomType = (data, callback) => {
  const sql = `
    INSERT INTO RoomTypes (name, description, max_occupants, rent_price, electricity_price, water_price, charge_type, is_active,landlord_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, TRUE,?)
  `;
  const {
    name,
    description,
    max_occupants,
    rent_price,
    electricity_price,
    water_price,
    charge_type,
    landlord_id
  } = data;
  db.query(sql, [name, description, max_occupants, rent_price, electricity_price, water_price, charge_type,landlord_id], (err, result) => {
    if (err) return callback(err);
    callback(null, result);
  });
};

// Cập nhật loại phòng
exports.updateRoomType = (id, data, callback) => {
  const sql = `
    UPDATE RoomTypes
    SET name = ?, description = ?, max_occupants = ?, rent_price = ?, electricity_price = ?, water_price = ?, charge_type = ?
    WHERE room_type_id = ? AND is_active = TRUE
  `;
  const {
    name,
    description,
    max_occupants,
    rent_price,
    electricity_price,
    water_price,
    charge_type,
  } = data;
  db.query(sql, [name, description, max_occupants, rent_price, electricity_price, water_price, charge_type, id], (err, result) => {
    if (err) return callback(err);
    callback(null, result);
  });
};

// Xóa loại phòng (cập nhật is_active = FALSE)
exports.deleteRoomType = (id, callback) => {
  const sql = 'UPDATE RoomTypes SET is_active = FALSE WHERE room_type_id = ?';
  db.query(sql, [id], (err, result) => {
    if (err) return callback(err);
    callback(null, result);
  });
};
