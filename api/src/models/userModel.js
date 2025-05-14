const db = require('../config/db');

// Kiểm tra xem email đã tồn tại trong cơ sở dữ liệu chưa
exports.checkEmailExists = (email, callback) => {
  db.query('SELECT * FROM Users WHERE email = ?', [email], (err, results) => {
    if (err) return callback(err, null);
    callback(null, results);
  });
};

// Lưu người dùng vào cơ sở dữ liệu
exports.createUser = (username, password_hash, email, phone, role, callback) => {
  const query = 'INSERT INTO Users (username, password_hash, email, phone, role) VALUES (?, ?, ?, ?, ?)';
  db.query(query, [username, password_hash, email, phone, role], (err, result) => {
    if (err) return callback(err, null);
    callback(null, result);
  });
};

// Kiểm tra thông tin đăng nhập của người dùng
exports.findUserByEmail = (email, callback) => {
  db.query('SELECT * FROM Users WHERE email = ?', [email], (err, results) => {
    if (err) return callback(err, null);
    callback(null, results);
  });
};
