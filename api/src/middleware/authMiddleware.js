const jwt = require('jsonwebtoken');

// Middleware để xác thực JWT và lấy thông tin người dùng
exports.authenticate = (req, res, next) => {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(401).json({ error: 'Không có token, truy cập bị từ chối' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Token không hợp lệ' });
    }
    req.user = decoded;
    next();
  });
};

// Middleware để kiểm tra quyền admin
exports.isAdmin = (req, res, next) => {
  if (req.user.role !== 'Admin') {
    return res.status(403).json({ error: 'Không có quyền admin' });
  }
  next();
};

// Middleware để kiểm tra quyền landlord
exports.isLandlord = (req, res, next) => {
  if (req.user.role !== 'Landlord') {
    return res.status(403).json({ error: 'Không có quyền landlord' });
  }
  next();
};

// Middleware để kiểm tra quyền renter
exports.isRenter = (req, res, next) => {
  if (req.user.role !== 'Renter') {
    return res.status(403).json({ error: 'Không có quyền renter' });
  }
  next();
};
