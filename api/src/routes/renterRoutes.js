const express = require('express');
const router = express.Router();
const renterController = require('../controllers/renterController');
const { authenticate, isRenter } = require('../middleware/authMiddleware');
router.get('/payment-redirect', renterController.redirectPayment);
router.use(authenticate, isRenter);
router.get('/rooms/available', renterController.getAvailableRooms);
router.get('/rooms/:roomId', renterController.getRoomDetail);
router.get('/contracts/active', renterController.getActiveContracts);
router.post('/contracts/rent', renterController.rentRoom);
router.put('/contracts/leave/:contractId', renterController.leaveRoom);
router.put('/contracts/:contractId/cancel', renterController.cancelContract);
router.get('/profile', renterController.getProfile);
router.put('/profile', renterController.updateProfile);
router.post('/create-payment',renterController.createPayment);

module.exports = router;