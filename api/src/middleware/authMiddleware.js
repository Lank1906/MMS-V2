const jwt = require('jsonwebtoken');

// Middleware xác thực token chuẩn Bearer Token
exports.authenticate = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token không đúng chuẩn Bearer' });
  }

  const token = authHeader.split(' ')[1];

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Token không hợp lệ' });
    }
    req.user = decoded;
    next();
  });
};

// Check role
exports.isAdmin = (req, res, next) => {
  if (req.user.role !== 'Admin') {
    return res.status(403).json({ error: 'Không có quyền admin' });
  }
  next();
};

exports.isLandlord = (req, res, next) => {
  if (req.user.role !== 'Landlord') {
    return res.status(403).json({ error: 'Không có quyền landlord' });
  }
  next();
};

exports.isRenter = (req, res, next) => {
  if (req.user.role !== 'Renter') {
    return res.status(403).json({ error: 'Không có quyền renter' });
  }
  next();
};
