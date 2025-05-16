const express = require('express');
const router = express.Router();
const roomTypeController = require('../controllers/roomTypeController');
const { authenticate, isLandlord } = require('../middleware/authMiddleware');

// Bắt buộc phải xác thực và phải là landlord mới được thao tác với loại phòng
router.use(authenticate, isLandlord);

router.get('/', roomTypeController.getRoomTypes);
router.get('/:id', roomTypeController.getRoomTypeById);
router.post('/', roomTypeController.createRoomType);
router.put('/:id', roomTypeController.updateRoomType);
router.delete('/:id', roomTypeController.deleteRoomType);

module.exports = router;
