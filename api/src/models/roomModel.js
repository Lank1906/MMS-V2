const db = require('../config/db');

// Lấy danh sách phòng theo landlord với filter + pagination
exports.getRooms = (landlordId, filters, callback) => {
  const { page = 1, limit = 10, search = '', propertyId, status, priceMin, priceMax } = filters;
  const offset = (page - 1) * limit;

  let sql = `
    SELECT r.room_id, r.room_number, r.status, r.max_occupants, r.property_id, r.room_type_id, rt.name AS room_type_name, rt.rent_price
    FROM Rooms r
    JOIN Properties p ON r.property_id = p.property_id
    JOIN RoomTypes rt ON r.room_type_id = rt.room_type_id
    WHERE p.landlord_id = ? AND r.is_active = TRUE
  `;

  const params = [landlordId];

  if (propertyId) {
    sql += ' AND r.property_id = ?';
    params.push(propertyId);
  }

  if (status) {
    sql += ' AND r.status = ?';
    params.push(status);
  }

  if (search) {
    sql += ' AND r.room_number LIKE ?';
    params.push(`%${search}%`);
  }

  if (priceMin) {
    sql += ' AND rt.rent_price >= ?';
    params.push(priceMin);
  }

  if (priceMax) {
    sql += ' AND rt.rent_price <= ?';
    params.push(priceMax);
  }

  sql += ' ORDER BY r.room_id DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);

  db.query(sql, params, (err, results) => {
    if (err) return callback(err);

    // Đếm tổng số để phân trang
    let countSql = `
      SELECT COUNT(*) AS total
      FROM Rooms r
      JOIN Properties p ON r.property_id = p.property_id
      JOIN RoomTypes rt ON r.room_type_id = rt.room_type_id
      WHERE p.landlord_id = ? AND r.is_active = TRUE
    `;
    const countParams = [landlordId];

    if (propertyId) {
      countSql += ' AND r.property_id = ?';
      countParams.push(propertyId);
    }

    if (status) {
      countSql += ' AND r.status = ?';
      countParams.push(status);
    }

    if (search) {
      countSql += ' AND r.room_number LIKE ?';
      countParams.push(`%${search}%`);
    }

    if (priceMin) {
      countSql += ' AND rt.rent_price >= ?';
      countParams.push(priceMin);
    }

    if (priceMax) {
      countSql += ' AND rt.rent_price <= ?';
      countParams.push(priceMax);
    }

    db.query(countSql, countParams, (err2, countResult) => {
      if (err2) return callback(err2);
      callback(null, { rooms: results, total: countResult[0].total });
    });
  });
};

// Lấy chi tiết phòng
exports.getRoomById = (roomId, landlordId, callback) => {
  const sql = `
    SELECT r.*,
           rt.name AS room_type_name,
           rt.rent_price,
           rt.electricity_price,
           rt.water_price,
           rt.charge_type,
           rt.description
    FROM Rooms r
    JOIN Properties p ON r.property_id = p.property_id
    JOIN RoomTypes rt ON r.room_type_id = rt.room_type_id
    WHERE r.room_id = ? AND p.landlord_id = ? AND r.is_active = TRUE
  `;
  db.query(sql, [roomId, landlordId], (err, results) => {
    if (err) return callback(err);
    callback(null, results[0]);
  });
};

// Thêm phòng mới
exports.createRoom = (landlordId, data, callback) => {
  const sql = `
    INSERT INTO Rooms (property_id, room_type_id, room_number, max_occupants, status, is_active)
    VALUES (?, ?, ?, ?, ?, TRUE)
  `;

  // Bạn nên kiểm tra property_id thuộc landlordId ở controller trước khi gọi hàm này
  db.query(
    sql,
    [data.property_id, data.room_type_id, data.room_number, data.max_occupants, data.status],
    (err, result) => {
      if (err) return callback(err);
      callback(null, result);
    }
  );
};

// Cập nhật phòng
exports.updateRoom = (roomId, landlordId, data, callback) => {
  const sql = `
    UPDATE Rooms r
    JOIN Properties p ON r.property_id = p.property_id
    SET r.property_id = ?, r.room_type_id = ?, r.room_number = ?, r.max_occupants = ?, r.status = ?
    WHERE r.room_id = ? AND p.landlord_id = ? AND r.is_active = TRUE
  `;

  db.query(
    sql,
    [data.property_id, data.room_type_id, data.room_number, data.max_occupants, data.status, roomId, landlordId],
    (err, result) => {
      if (err) return callback(err);
      callback(null, result);
    }
  );
};

// Xóa phòng (cập nhật is_active = FALSE)
exports.deleteRoom = (roomId, landlordId, callback) => {
  const sql = `
    UPDATE Rooms r
    JOIN Properties p ON r.property_id = p.property_id
    SET r.is_active = FALSE
    WHERE r.room_id = ? AND p.landlord_id = ?
  `;

  db.query(sql, [roomId, landlordId], (err, result) => {
    if (err) return callback(err);
    callback(null, result);
  });
};
