const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');
const { authenticate, isLandlord } = require('../middleware/authMiddleware');

router.use(authenticate, isLandlord);

router.get('/', serviceController.getServices);
router.get('/:id', serviceController.getServiceById);
router.post('/', serviceController.createService);
router.put('/:id', serviceController.updateService);
router.delete('/:id', serviceController.deleteService);

module.exports = router;
