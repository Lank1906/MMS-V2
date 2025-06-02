const db = require('../config/db');

// Hàm lấy danh sách phòng trống
exports.getAvailableRooms = (address, minPrice, maxPrice, page, limit, callback) => {
  const offset = (page - 1) * limit;
  const sql = `
    SELECT 
      r.room_id, r.room_number, r.status, r.is_active, r.image_url,
      p.address AS property_address,
      rt.rent_price,
      rt.name AS room_type_name
    FROM Rooms r
    JOIN Properties p ON r.property_id = p.property_id
    JOIN RoomTypes rt ON r.room_type_id = rt.room_type_id
    WHERE r.status = 'Available' AND r.is_active = TRUE
      AND p.address LIKE ? AND rt.rent_price BETWEEN ? AND ? AND p.is_active = TRUE
    ORDER BY r.room_id DESC
    LIMIT ? OFFSET ?
  `;
  
  db.query(sql, [`%${address}%`, minPrice, maxPrice, limit, offset], (err, results) => {
    if (err) return callback(err);

    const countSql = `
      SELECT COUNT(*) AS total 
      FROM Rooms r
      JOIN Properties p ON r.property_id = p.property_id
      JOIN RoomTypes rt ON r.room_type_id = rt.room_type_id
      WHERE r.status = 'Available' AND r.is_active = TRUE
        AND p.address LIKE ? AND rt.rent_price BETWEEN ? AND ? AND p.is_active = TRUE
    `;
    
    db.query(countSql, [`%${address}%`, minPrice, maxPrice], (err2, countResult) => {
      if (err2) return callback(err2);
      callback(null, { rooms: results, total: countResult[0].total });
    });
  });
};

// Lấy chi tiết phòng theo ID kèm thông tin chủ nhà
exports.getRoomById = (roomId, callback) => {
  const sql = `
    SELECT 
      r.room_id, r.room_number, r.status, r.is_active, r.image_url,
      p.address AS property_address,
      rt.rent_price, rt.description, rt.max_occupants, rt.electricity_price, rt.water_price,
      rt.name AS room_type_name,
      u.user_id AS landlord_id,
      u.username AS landlord_name,
      u.phone AS landlord_phone,
      u.email AS landlord_email
    FROM Rooms r
    JOIN Properties p ON r.property_id = p.property_id
    JOIN RoomTypes rt ON r.room_type_id = rt.room_type_id
    JOIN Users u ON p.landlord_id = u.user_id
    WHERE r.room_id = ? AND r.is_active = TRUE AND p.is_active = TRUE
  `;
  db.query(sql, [roomId], (err, results) => {
    if (err) return callback(err);
    callback(null, results[0]);
  });
};

// Hàm lấy hợp đồng active của user
exports.getActiveContractsByUser = (userId, callback) => {
  const sql = `
    SELECT * FROM Contracts 
    WHERE renter_id = ? AND status = 'Active' AND is_active = TRUE
  `;
  db.query(sql, [userId], (err, results) => {
    if (err) return callback(err);
    callback(null, results);
  });
};

// Hàm tạo hợp đồng mới
exports.createContract = (contractData, callback) => {
  const sql = `
    INSERT INTO Contracts (room_id, renter_id, start_date, rent_price, total_water_price, total_electricity_price, total_service_price, status, payment_status, payment_method, is_active,deposit_amount)
    VALUES (?, ?, ?, ?, 0, 0, 0, 'Active', 'Unpaid', NULL, TRUE,?)
  `;
  const { room_id, renter_id, start_date, rent_price,amount } = contractData;
  db.query(sql, [room_id, renter_id, start_date, rent_price,amount], (err, result) => {
    if (err) return callback(err);
    callback(null, result);
  });
};

exports.addRenterToRoom = ({ room_id, renter_id, join_date }, callback) => {
  const sql = `
    INSERT INTO Room_Renters (room_id, renter_id, join_date, status)
    VALUES (?, ?, ?, 'Active')
  `;
  db.query(sql, [room_id, renter_id, join_date], callback);
};

// Cập nhật trạng thái phòng khi người dùng trả phòng
exports.updateRoomStatus = (roomId,renterId, status, callback) => {
  const sql = `UPDATE Rooms SET status = ?, current_occupants = ${renterId==0?1:0} WHERE room_id = ? AND is_active = TRUE`;

  db.query(sql, [status, roomId], (err, result) => {
    if (err) return callback(err);

    // Xoá người thuê còn active khỏi bảng Room_Renters
    const deleteSql = `DELETE FROM Room_Renters WHERE room_id = ? AND renter_id=? AND status = 'Active'`;
    db.query(deleteSql, [roomId,renterId], (err2, result2) => {
      if (err2) return callback(err2);
      callback(null, result);
    });
  });
};

// Cập nhật trạng thái hợp đồng
exports.updateContract = (contractId, updateData, callback) => {
  const fields = [];
  const values = [];
  for (const key in updateData) {
    fields.push(`${key} = ?`);
    values.push(updateData[key]);
  }
  const sql = `UPDATE Contracts SET ${fields.join(', ')} WHERE contract_id = ?`;
  values.push(contractId);
  db.query(sql, values, (err, result) => {
    if (err) return callback(err);
    callback(null, result);
  });
};

// Lấy thông tin người dùng
exports.getUserById = (userId, callback) => {
  const sql = 'SELECT user_id, username, email, phone, address FROM Users WHERE user_id = ? AND is_active = TRUE';
  db.query(sql, [userId], (err, results) => {
    if (err) return callback(err);
    callback(null, results[0]);
  });
};

// Cập nhật thông tin người dùng
exports.updateUser = (userId, updateData, callback) => {
  const fields = [];
  const values = [];
  for (const key in updateData) {
    fields.push(`${key} = ?`);
    values.push(updateData[key]);
  }
  const sql = `UPDATE Users SET ${fields.join(', ')} WHERE user_id = ?`;
  values.push(userId);
  db.query(sql, values, (err, result) => {
    if (err) return callback(err);
    callback(null, result);
  });
};

// Lấy thông tin hợp đồng chưa thanh toán của người dùng
exports.getUnpaidContractsByUser = (userId, callback) => {
  const sql = `
    SELECT * FROM Contracts 
    WHERE renter_id = ? AND status = 'Active' AND payment_status = 'Unpaid' AND is_active = TRUE
  `;
  db.query(sql, [userId], (err, results) => {
    if (err) return callback(err);
    callback(null, results); // Trả về danh sách hợp đồng chưa thanh toán của người dùng
  });
};

exports.updateContractPaymentStatus = (orderId, updateData) => {
  return new Promise((resolve, reject) => {
    const { payment_status, payment_amount, message } = updateData;
    const sql = `
      UPDATE Contracts 
      SET payment_status = ?, payment_method = ?,payment_date=?
      WHERE contract_id = ? AND is_active = TRUE
    `;
    
    db.query(sql, [payment_status, 'Bank Transfer',new Date(),  orderId.split('LANK')[0]], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

exports.getContractsByUserAndPaymentStatus = (userId, paymentStatus, callback) => {
  const sql = `
    SELECT * FROM Contracts
    WHERE renter_id = ? AND payment_status = ? AND is_active = TRUE
  `;
  db.query(sql, [userId, paymentStatus], callback);
};

exports.cancelContract = (contractId, callback) => {
  const sql = `
    UPDATE Contracts
    SET status = 'Terminated', is_active = FALSE
    WHERE contract_id = ? AND status = 'Active' AND is_active = TRUE
  `;
  db.query(sql, [contractId], (err, result) => {
    if (err) return callback(err);
    if (result.affectedRows === 0) return callback(new Error('Hợp đồng không tồn tại hoặc không thể hủy.'));
    callback(null, { message: 'Hợp đồng đã được hủy thành công.' });
  });
};

exports.getContractsByUserAndPaymentStatus = (userId, paymentStatus, callback) => {
  const sql = `
    SELECT * FROM Contracts
    WHERE renter_id = ? AND payment_status = ? AND is_active = TRUE
  `;
  db.query(sql, [userId, paymentStatus], callback);
};

// Giả lập thanh toán hợp đồng: cập nhật payment_status = 'Paid'
exports.simulatePayment = (contractId, callback) => {
  const sql = `
    UPDATE Contracts 
    SET payment_status = 'Paid' 
    WHERE contract_id = ? AND is_active = TRUE
  `;
  db.query(sql, [contractId], (err, result) => {
    if (err) return callback(err);
    callback(null, result);
  });
};