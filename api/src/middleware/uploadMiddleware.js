const multer = require('multer');
const path = require('path');

// Cấu hình lưu file
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // thư mục lưu file
  },
  filename: function (req, file, cb) {
    // Tạo tên file duy nhất: fieldname + timestamp + random + phần mở rộng
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

// Khởi tạo multer upload
const upload = multer({ storage });

module.exports = upload;
