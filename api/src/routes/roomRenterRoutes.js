const express = require('express');
const router = express.Router();
const roomRenterController = require('../controllers/roomRenterController');
const { authenticate, isLandlord } = require('../middleware/authMiddleware');

router.use(authenticate, isLandlord);

// GET /api/room-renter/:roomId
router.get('/:roomId', roomRenterController.getRoomRenters);

// POST /api/room-renter/:roomId
router.post('/:roomId', roomRenterController.createRoomRenter);

// PUT /api/room-renter/:roomId/:roomRenterId
router.put('/:roomId/:roomRenterId', roomRenterController.updateRoomRenter);

// DELETE /api/room-renter/:roomId/:roomRenterId
router.delete('/:roomId/:roomRenterId', roomRenterController.deleteRoomRenter);

module.exports = router;
