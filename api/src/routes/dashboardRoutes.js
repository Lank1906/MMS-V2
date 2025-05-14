const express = require('express');
const dashboardController = require('../controllers/dashboardController');

const router = express.Router();

// Route để lấy dữ liệu Dashboard
router.get('/dashboard', dashboardController.getDashboard);

module.exports = router;
