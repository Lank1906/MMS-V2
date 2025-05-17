const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const { authenticate } = require('../middleware/authMiddleware'); // Middleware xác thực user

// Chỉ cho phép user đã đăng nhập upload ảnh
router.post('/upload-image', authenticate, uploadController.uploadImage);

module.exports = router;
