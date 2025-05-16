const express = require('express');
const router = express.Router();
const propertyController = require('../controllers/propertyController');
const { authenticate, isLandlord } = require('../middleware/authMiddleware');

router.use(authenticate, isLandlord);

router.get('/', propertyController.getProperties);
router.get('/:id', propertyController.getPropertyById);
router.post('/', propertyController.createProperty);
router.put('/:id', propertyController.updateProperty);
router.delete('/:id', propertyController.deleteProperty);

module.exports = router;
