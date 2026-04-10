const express = require('express');
const router = express.Router();
const PaymentController = require('../controllers/paymentController');

/**
 * @swagger
 * components:
 *   schemas:
 *     Payment:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         orderId:
 *           type: string
 *         customerId:
 *           type: string
 *         amount:
 *           type: number
 *         currency:
 *           type: string
 *         method:
 *           type: string
 *           enum: [CREDIT_CARD, DEBIT_CARD, PAYPAL, BANK_TRANSFER, CASH_ON_DELIVERY]
 *         status:
 *           type: string
 *           enum: [PENDING, COMPLETED, FAILED, REFUNDED]
 *         transactionRef:
 *           type: string
 *         createdAt:
 *           type: string
 *     PaymentInput:
 *       type: object
 *       required:
 *         - orderId
 *         - customerId
 *         - amount
 *         - method
 *       properties:
 *         orderId:
 *           type: string
 *           example: order-abc-123
 *         customerId:
 *           type: string
 *           example: customer-xyz-456
 *         amount:
 *           type: number
 *           example: 149.99
 *         currency:
 *           type: string
 *           example: USD
 *         method:
 *           type: string
 *           enum: [CREDIT_CARD, DEBIT_CARD, PAYPAL, BANK_TRANSFER, CASH_ON_DELIVERY]
 *           example: CREDIT_CARD
 */

/**
 * @swagger
 * /payments:
 *   get:
 *     summary: Get all payments
 *     tags: [Payments]
 *     responses:
 *       200:
 *         description: List of all payments
 */
router.get('/', PaymentController.getAllPayments);

/**
 * @swagger
 * /payments/{id}:
 *   get:
 *     summary: Get a payment by ID
 *     tags: [Payments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Payment found
 *       404:
 *         description: Payment not found
 */
router.get('/:id', PaymentController.getPaymentById);

/**
 * @swagger
 * /payments/order/{orderId}:
 *   get:
 *     summary: Get payment by order ID
 *     tags: [Payments]
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Payment found
 *       404:
 *         description: No payment found for this order
 */
router.get('/order/:orderId', PaymentController.getPaymentByOrder);

/**
 * @swagger
 * /payments/customer/{customerId}:
 *   get:
 *     summary: Get all payments by customer ID
 *     tags: [Payments]
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Payments for the customer
 */
router.get('/customer/:customerId', PaymentController.getPaymentsByCustomer);

/**
 * @swagger
 * /payments:
 *   post:
 *     summary: Process a new payment
 *     tags: [Payments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PaymentInput'
 *     responses:
 *       201:
 *         description: Payment processed successfully
 *       400:
 *         description: Missing required fields or invalid method
 *       402:
 *         description: Payment failed
 */
router.post('/', PaymentController.processPayment);

/**
 * @swagger
 * /payments/{id}/refund:
 *   patch:
 *     summary: Refund a payment
 *     tags: [Payments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Payment refunded
 *       400:
 *         description: Payment cannot be refunded
 *       404:
 *         description: Payment not found
 */
router.patch('/:id/refund', PaymentController.refundPayment);

module.exports = router;