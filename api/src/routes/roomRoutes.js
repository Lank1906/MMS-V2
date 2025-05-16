const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');
const { authenticate, isLandlord } = require('../middleware/authMiddleware');

router.use(authenticate, isLandlord);

router.get('/', roomController.getRooms);
router.get('/:id', roomController.getRoomById);
router.post('/', roomController.createRoom);
router.put('/:id', roomController.updateRoom);
router.delete('/:id', roomController.deleteRoom);

module.exports = router;
