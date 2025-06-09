const db = require('../config/db');

exports.getBillsByContract = (contractId, callback) => {
  const sql = `
    SELECT * FROM Bills 
    WHERE contract_id = ? 
    ORDER BY bill_month ASC
  `;
  db.query(sql, [contractId], (err, results) => {
    if (err) return callback(err);
    callback(null, results);
  });
};

exports.getBillById = (id, callback) => {
  const sql = `SELECT * FROM Bills WHERE bill_id = ?`;
  db.query(sql, [id], (err, results) => {
    if (err) return callback(err);
    callback(null, results[0]);
  });
};

exports.createBill = (data, callback) => {
  db.beginTransaction(err => {
    if (err) return callback(err);
    const updateContractTerm = (next) => {
      if (data.term_extended && data.term_extended > 0) {
        const sqlUpdate = `
          UPDATE Contracts 
          SET term_months = term_months + ?
          WHERE contract_id = ?
        `;
        db.query(sqlUpdate, [data.term_extended, data.contract_id], next);
      } else {
        next(null);
      }
    };

    const insertBill = (next) => {
      const sqlInsert = `
        INSERT INTO Bills (
          contract_id,
          bill_month,
          total_amount,
          water_amount,
          electricity_amount,
          service_amount,
          rent_amount,
          payment_status,
          payment_date
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      db.query(sqlInsert, [
        data.contract_id,
        data.bill_month,
        data.total_amount,
        data.water_amount,
        data.electricity_amount,
        data.service_amount,
        data.rent_amount || 0,
        data.payment_status || 'Unpaid',
        data.payment_date || null
      ], (err, result) => {
        if (err) return next(err);
        data.bill_id = result.insertId;
        next(null);
      });
    };

    const updateRoomUsage = (next) => {
      const sqlUpdateRoom = `
        UPDATE Rooms 
        SET current_water_usage = ?, current_electricity_usage = ?
        WHERE room_id = ?
      `;
      db.query(sqlUpdateRoom, [
        data.new_water,
        data.new_electric,
        data.room_id
      ], next);
    };

    // Chuỗi thực hiện tuần tự
    updateContractTerm(err => {
      if (err) return db.rollback(() => callback(err));

      insertBill(err => {
        if (err) return db.rollback(() => callback(err));

        updateRoomUsage(err => {
          if (err) return db.rollback(() => callback(err));

          db.commit(commitErr => {
            if (commitErr) return db.rollback(() => callback(commitErr));
            callback(null, { message: 'Tạo hóa đơn và cập nhật thành công.' });
          });
        });
      });
    });
  });
};

exports.deleteBill = (id, callback) => {
  const sql = `DELETE FROM Bills WHERE bill_id = ?`;
  db.query(sql, [id], (err, result) => {
    if (err) return callback(err);
    callback(null, result);
  });
};
