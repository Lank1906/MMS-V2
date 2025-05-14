const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');

// Đăng ký người dùng mới
exports.register = (req, res) => {
  const { username, password, email, phone } = req.body;

  // Kiểm tra xem email đã tồn tại chưa
  userModel.checkEmailExists(email, (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Lỗi cơ sở dữ liệu' });
    }
    if (results.length > 0) {
      return res.status(400).json({ error: 'Email đã tồn tại' });
    }

    // Mã hóa mật khẩu
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    // Lưu người dùng vào cơ sở dữ liệu
    userModel.createUser(username, hashedPassword, email, phone, 'Renter', (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Lỗi khi tạo người dùng' });
      }

      // Tạo token JWT với role
      const token = jwt.sign(
        { user_id: result.insertId, role: 'Renter' }, 
        process.env.JWT_SECRET, 
        { expiresIn: '1h' }
      );

      res.status(201).json({ message: 'Đăng ký thành công', token });
    });
  });
};

// Đăng nhập người dùng
exports.login = (req, res) => {
  const { email, password } = req.body;

  // Kiểm tra email trong cơ sở dữ liệu
  userModel.findUserByEmail(email, (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Lỗi cơ sở dữ liệu' });
    }
    if (results.length === 0) {
      return res.status(400).json({ error: 'Email không tồn tại' });
    }

    // Kiểm tra mật khẩu
    const user = results[0];
    if (!bcrypt.compareSync(password, user.password_hash)) {
      return res.status(400).json({ error: 'Mật khẩu không đúng' });
    }

    // Tạo token JWT với role
    const token = jwt.sign(
      { user_id: user.user_id, role: user.role }, // role sẽ được lấy từ cơ sở dữ liệu
      process.env.JWT_SECRET, 
      { expiresIn: '1h' }
    );

    res.status(200).json({ message: 'Đăng nhập thành công', token });
  });
};
