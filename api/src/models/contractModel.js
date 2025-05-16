const db = require('../config/db');

exports.getContracts = (landlordId, roomId, callback) => {
  const sql = `
    SELECT c.*, r.room_number 
    FROM Contracts c
    JOIN Rooms r ON c.room_id = r.room_id
    WHERE c.room_id = ? AND r.property_id IN (
      SELECT property_id FROM Properties WHERE landlord_id = ?
    ) AND c.is_active = TRUE
    ORDER BY c.start_date DESC
  `;
  db.query(sql, [roomId, landlordId], (err, results) => {
    if (err) return callback(err);
    callback(null, results);
  });
};

exports.getContractById = (id, landlordId, callback) => {
  const sql = `
    SELECT c.*, r.room_number
    FROM Contracts c
    JOIN Rooms r ON c.room_id = r.room_id
    WHERE c.contract_id = ? AND r.property_id IN (
      SELECT property_id FROM Properties WHERE landlord_id = ?
    ) AND c.is_active = TRUE
  `;
  db.query(sql, [id, landlordId], (err, results) => {
    if (err) return callback(err);
    callback(null, results[0]);
  });
};

exports.createContract = (data, callback) => {
  const sql = `
    INSERT INTO Contracts (room_id, renter_id, start_date, end_date, rent_price, total_water_price, total_electricity_price, total_service_price, status, is_active)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE)
  `;
  db.query(sql, [
    data.room_id,
    data.renter_id,
    data.start_date,
    data.end_date,
    data.rent_price,
    data.total_water_price,
    data.total_electricity_price,
    data.total_service_price,
    data.status
  ], (err, result) => {
    if (err) return callback(err);
    callback(null, result);
  });
};

exports.updateContract = (id, data, callback) => {
  const sql = `
    UPDATE Contracts
    SET start_date = ?, end_date = ?, rent_price = ?, total_water_price = ?, total_electricity_price = ?, total_service_price = ?, status = ?
    WHERE contract_id = ? AND is_active = TRUE
  `;
  db.query(sql, [
    data.start_date,
    data.end_date,
    data.rent_price,
    data.total_water_price,
    data.total_electricity_price,
    data.total_service_price,
    data.status,
    id
  ], (err, result) => {
    if (err) return callback(err);
    callback(null, result);
  });
};

exports.deleteContract = (id, callback) => {
  const sql = 'UPDATE Contracts SET is_active = FALSE WHERE contract_id = ?';
  db.query(sql, [id], (err, result) => {
    if (err) return callback(err);
    callback(null, result);
  });
};
