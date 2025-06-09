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
exports.createContract = (data, callback) => {
    console.log(data)
  const {
    room_id,
    renter_id,
    rent_price,
    deposit_amount = 0,
    months = 1
  } = data;

  const start_date = new Date();
  const end_date = new Date(start_date);
  end_date.setMonth(end_date.getMonth() + parseInt(months));

  const formattedStart = start_date.toISOString().split('T')[0];
  const formattedEnd = end_date.toISOString().split('T')[0];

  const sql = `
    INSERT INTO Contracts (
      room_id,
      renter_id,
      start_date,
      end_date,
      deposit_amount,
      term_months,
      status,
      is_active
    ) VALUES (?, ?, ?, ?, ?, ?, 'Active', 1)
  `;

  const values = [
    room_id,
    renter_id,
    formattedStart,
    formattedEnd,
    deposit_amount,
    months
  ];

  db.query(sql, values, (err, result) => {
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
exports.getUnpaidBillsByUser = (userId, callback) => {
  const sql = `
    SELECT 
      b.*, r.room_number, rt.name AS room_type_name
    FROM Bills b
    JOIN Contracts c ON b.contract_id = c.contract_id
    JOIN Rooms r ON c.room_id = r.room_id
    JOIN RoomTypes rt ON r.room_type_id = rt.room_type_id
    WHERE c.renter_id = ? AND b.payment_status = 'Unpaid'
    ORDER BY b.bill_month DESC
  `;
  db.query(sql, [userId], callback);
};

exports.updateContractPaymentStatus = (orderId, updateData) => {
  return new Promise((resolve, reject) => {
    const { payment_status } = updateData;
    const contractId = orderId.split('LANK')[0];

    const sql = `
      UPDATE Bills
      SET payment_status = ?, payment_date = ?
      WHERE contract_id = ? AND payment_status = 'Unpaid'
      ORDER BY bill_month DESC
      LIMIT 1
    `;

    db.query(sql, [payment_status, new Date(), contractId], (err, result) => {
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
    SELECT c.*, b.payment_status, b.payment_date
    FROM Contracts c
    JOIN Bills b ON c.contract_id = b.contract_id
    WHERE c.renter_id = ? AND b.payment_status = ? AND c.is_active = TRUE
  `;
  db.query(sql, [userId, paymentStatus], callback);
};
// Giả lập thanh toán hợp đồng: cập nhật payment_status = 'Paid'
exports.simulatePayment = (contractId, callback) => {
  const sql = `
    UPDATE Bills 
    SET payment_status = 'Paid', payment_date = ?
    WHERE contract_id = ? AND payment_status = 'Unpaid'
    ORDER BY bill_month DESC
    LIMIT 1
  `;
  db.query(sql, [new Date(), contractId], (err, result) => {
    if (err) return callback(err);
    callback(null, result);
  });
};

exports.getBillsByContractId = (contractId, callback) => {
  const sql = `
    SELECT * FROM Bills 
    WHERE contract_id = ? 
    ORDER BY bill_month DESC
  `;
  db.query(sql, [contractId], (err, results) => {
    if (err) return callback(err);
    callback(null, results);
  });
};

// Lấy thông tin hợp đồng và danh sách hóa đơn theo contract_id và user
exports.getContractWithBills = (userId, contractId, callback) => {
  const sql = `
    SELECT c.*, b.*
    FROM Contracts c
    LEFT JOIN Bills b ON c.contract_id = b.contract_id
    WHERE c.contract_id = ? AND c.renter_id = ?
  `;

  db.query(sql, [contractId, userId], (err, results) => {
    if (err) return callback(err);

    if (results.length === 0) return callback(null, null, []);

    const contract = {
      contract_id: results[0].contract_id,
      room_id: results[0].room_id,
      renter_id: results[0].renter_id,
      status: results[0].status,
      deposit_amount: results[0].deposit_amount
    };

    const bills = results.map(r => ({
      bill_id: r.bill_id,
      payment_status: r.payment_status,
      total_amount: r.total_amount,
      bill_month: r.bill_month
    }));

    callback(null, contract, bills);
  });
};

// Đếm số hợp đồng "Active" của người thuê
exports.countActiveContractsByUser = (userId, callback) => {
  const sql = `
    SELECT COUNT(*) AS total
    FROM Contracts
    WHERE renter_id = ? AND status = 'Active'
  `;
  db.query(sql, [userId], (err, results) => {
    if (err) return callback(err);
    callback(null, results[0].total);
  });
};