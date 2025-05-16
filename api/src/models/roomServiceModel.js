const db = require('../config/db');

exports.getRoomServices = (landlordId, roomId, callback) => {
  const sql = `
    SELECT rs.*, s.service_name, s.service_price
    FROM Room_Services rs
    JOIN Services s ON rs.service_id = s.service_id
    JOIN Rooms r ON rs.room_id = r.room_id
    WHERE rs.room_id = ? AND r.property_id IN (
      SELECT property_id FROM Properties WHERE landlord_id = ?
    ) AND rs.is_active = TRUE
  `;
  db.query(sql, [roomId, landlordId], (err, results) => {
    if (err) return callback(err);
    callback(null, results);
  });
};

exports.createRoomService = (data, callback) => {
  const sql = `
    INSERT INTO Room_Services (room_id, service_id, is_active)
    VALUES (?, ?, TRUE)
  `;
  db.query(sql, [data.room_id, data.service_id], (err, result) => {
    if (err) return callback(err);
    callback(null, result);
  });
};

exports.deleteRoomService = (roomId, serviceId, callback) => {
  const sql = `
    UPDATE Room_Services
    SET is_active = FALSE
    WHERE room_id = ? AND service_id = ?
  `;
  db.query(sql, [roomId, serviceId], (err, result) => {
    if (err) return callback(err);
    callback(null, result);
  });
};
