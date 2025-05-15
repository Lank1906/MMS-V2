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

exports.getAllUsers = async (search, limit, offset) => {
  const [users] = await db.promise().query(`
    SELECT user_id, username, email, phone, role, is_active 
    FROM Users 
    WHERE username LIKE ? OR email LIKE ? 
    ORDER BY user_id DESC
    LIMIT ? OFFSET ?
  `, [`%${search}%`, `%${search}%`, Number(limit), Number(offset)]);
  return users;
};

exports.getTotalUsers = async (search) => {
  const [totalResult] = await db.promise().query(`
    SELECT COUNT(*) AS total 
    FROM Users 
    WHERE username LIKE ? OR email LIKE ?
  `, [`%${search}%`, `%${search}%`]);
  return totalResult[0].total;
};

exports.getUserById = async (id) => {
  const [user] = await db.promise().query(`
    SELECT user_id, username, email, phone, role, is_active 
    FROM Users 
    WHERE user_id = ?
  `, [id]);
  return user[0];
};

exports.updateUserRole = async (id, role) => {
  await db.promise().query(`UPDATE Users SET role=? WHERE user_id=?`, [role, id]);
};

exports.deleteUser = async (id) => {
  await db.promise().query(`DELETE FROM Users WHERE user_id=?`, [id]);
}
