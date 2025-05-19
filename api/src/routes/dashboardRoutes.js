const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authenticate } = require('../middleware/authMiddleware');

router.get('/', authenticate, dashboardController.getDashboard);
router.get('/landlord-revenue', authenticate, dashboardController.getLandlordRevenue);
router.get('/renter-revenue', authenticate, dashboardController.getRenterRevenue);

module.exports = router;
