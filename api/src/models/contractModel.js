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
  const sqlInsert = `
    INSERT INTO Contracts (room_id, renter_id, start_date, end_date, term_months, deposit_amount, status, is_active)
    VALUES (?, ?, ?, ?, ?, ?, ?, TRUE)
  `;

  const sqlUpdateRoom = `
    UPDATE Rooms
    SET current_electricity_usage = ?, current_water_usage = ?
    WHERE room_id = ? AND is_active = TRUE
  `;

  db.query(sqlUpdateRoom, [
    data.new_electricity_usage,
    data.new_water_usage,
    data.room_id
  ], (err) => {
    if (err) return callback(err);

    db.query(sqlInsert, [
      data.room_id,
      data.renter_id,
      data.start_date,
      data.end_date,
      data.term_months,
      data.deposit_amount || 0,
      data.status
    ], (err2, result) => {
      if (err2) return callback(err2);
      callback(null, result);
    });
  });
};

exports.updateContract = (id, data, callback) => {
  const sqlUpdateContract = `
    UPDATE Contracts
    SET start_date = ?, end_date = ?, term_months = ?, deposit_amount = ?, status = ?
    WHERE contract_id = ? AND is_active = TRUE
  `;

  const sqlUpdateRoom = `
    UPDATE Rooms
    SET current_electricity_usage = ?, current_water_usage = ?
    WHERE room_id = ? AND is_active = TRUE
  `;

  db.query(sqlUpdateRoom, [
    data.new_electricity_usage,
    data.new_water_usage,
    data.room_id
  ], (err) => {
    if (err) return callback(err);

    db.query(sqlUpdateContract, [
      data.start_date,
      data.end_date,
      data.term_months,
      data.deposit_amount || 0,
      data.status,
      id
    ], (err2, result) => {
      if (err2) return callback(err2);
      callback(null, result);
    });
  });
};

exports.deleteContract = (id, callback) => {
  const sql = 'UPDATE Contracts SET is_active = FALSE WHERE contract_id = ?';
  db.query(sql, [id], (err, result) => {
    if (err) return callback(err);
    callback(null, result);
  });
};
