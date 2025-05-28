const express = require('express');
const router = express.Router();

const { createTransferOrder, getOrders } = require('../controllers/orderController');

router.post('/transfer', createTransferOrder);
router.get('/', getOrders);

module.exports = router;
