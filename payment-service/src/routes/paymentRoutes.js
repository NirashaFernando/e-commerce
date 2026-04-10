const express = require('express');
const router = express.Router();
const PaymentController = require('../controllers/paymentController');



router.get('/', PaymentController.getAllPayments);


router.get('/:id', PaymentController.getPaymentById);


router.get('/order/:orderId', PaymentController.getPaymentByOrder);

router.get('/customer/:customerId', PaymentController.getPaymentsByCustomer);


router.post('/', PaymentController.processPayment);


router.patch('/:id/refund', PaymentController.refundPayment);

module.exports = router;
