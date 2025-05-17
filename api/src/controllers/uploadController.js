const upload = require('../middleware/uploadMiddleware');

exports.uploadImage = (req, res) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: 'Lỗi khi upload ảnh' });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'Chưa có file ảnh' });
    }

    // Đường dẫn truy cập ảnh từ client (lưu ý phải khớp với app.use static)
    const imageUrl = `/uploads/${req.file.filename}`;

    res.json({ message: 'Upload thành công', imageUrl });
  });
};
