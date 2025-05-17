const db = require('../config/db');

// Lấy danh sách renter theo room_id
exports.getRoomRentersByRoomId = (roomId, callback) => {
    const sql = `
        SELECT rr.*, u.username, u.phone
        FROM Room_Renters rr
        JOIN Users u ON rr.renter_id = u.user_id
        WHERE rr.room_id = ? AND rr.status = 'Active'
    `;
    db.query(sql, [roomId], (err, results) => {
        if (err) return callback(err);
        callback(null, results);
    });
};

// Thêm renter vào room
exports.createRoomRenter = (roomId, renterId, joinDate, callback) => {
    const sql = `
        INSERT INTO Room_Renters (room_id, renter_id, join_date, status)
        VALUES (?, ?, ?, 'Active')
    `;
    db.query(sql, [roomId, renterId, joinDate], (err, result) => {
        if (err) return callback(err);
        callback(null, result);
    });
};

// Cập nhật renter sang 'Left' + ngày trả phòng
exports.updateRoomRenter = (roomRenterId, roomId, leaveDate, callback) => {
    const sql = `
        UPDATE Room_Renters
        SET status = 'Left', leave_date = ?
        WHERE room_renter_id = ? AND room_id = ?
    `;
    db.query(sql, [leaveDate, roomRenterId, roomId], (err, result) => {
        if (err) return callback(err);
        callback(null, result);
    });
};

// Xoá cứng renter khỏi room
exports.deleteRoomRenter = (roomRenterId, roomId, callback) => {
    const sql = `
        DELETE FROM Room_Renters
        WHERE room_renter_id = ? AND room_id = ?
    `;
    db.query(sql, [roomRenterId, roomId], (err, result) => {
        if (err) return callback(err);
        callback(null, result);
    });
};
