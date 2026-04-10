const express = require('express');
const router = express.Router();
const OrderController = require('../controllers/orderController');


router.get('/', OrderController.getAllOrders);


router.get('/:id', OrderController.getOrderById);


router.get('/customer/:customerId', OrderController.getOrdersByCustomer);


router.post('/', OrderController.createOrder);


router.patch('/:id/status', OrderController.updateOrderStatus);


router.delete('/:id', OrderController.deleteOrder);

module.exports = router;
