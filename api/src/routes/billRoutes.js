const express = require('express');
const router = express.Router();
const billController = require('../controllers/billController');
const { authenticate, isLandlord } = require('../middleware/authMiddleware');

router.use(authenticate, isLandlord);

router.get('/contract/:contractId', billController.getBillsByContract);
router.get('/:id', billController.getBillById);
router.post('/', billController.createBill);
router.delete('/:id', billController.deleteBill);

module.exports = router;
