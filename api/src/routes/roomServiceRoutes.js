const express = require('express');
const router = express.Router();
const roomServiceController = require('../controllers/roomServiceController');
const { authenticate, isLandlord } = require('../middleware/authMiddleware');

router.use(authenticate, isLandlord);

router.get('/', roomServiceController.getRoomServices);
router.post('/', roomServiceController.createRoomService);
router.delete('/', roomServiceController.deleteRoomService);

module.exports = router;
