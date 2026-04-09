const Payment = require('../models/paymentModel');
const { v4: uuidv4 } = require('uuid');

const VALID_METHODS = ['CREDIT_CARD', 'DEBIT_CARD', 'PAYPAL', 'BANK_TRANSFER', 'CASH_ON_DELIVERY'];

const PaymentController = {
  getAllPayments: async (req, res) => {
    try {
      const payments = await Payment.find();
      res.json({ success: true, count: payments.length, data: payments });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
  },

  getPaymentById: async (req, res) => {
    try {
      const payment = await Payment.findById(req.params.id);
      if (!payment) {
        return res.status(404).json({ success: false, message: 'Payment not found' });
      }
      res.json({ success: true, data: payment });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
  },

  getPaymentByOrder: async (req, res) => {
    try {
      const payment = await Payment.findOne({ orderId: req.params.orderId });
      if (!payment) {
        return res.status(404).json({ success: false, message: 'No payment found for this order' });
      }
      res.json({ success: true, data: payment });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
  },

  getPaymentsByCustomer: async (req, res) => {
    try {
      const payments = await Payment.find({ customerId: req.params.customerId });
      res.json({ success: true, count: payments.length, data: payments });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
  },

  processPayment: async (req, res) => {
    try {
      const { orderId, customerId, amount, currency, method } = req.body;
      if (!orderId || !customerId || !amount || !method) {
        return res.status(400).json({ success: false, message: 'orderId, customerId, amount, and method are required' });
      }
      if (!VALID_METHODS.includes(method)) {
        return res.status(400).json({ success: false, message: `Method must be one of: ${VALID_METHODS.join(', ')}` });
      }
      // Simulate payment processing — 90% success rate
      const isSuccess = Math.random() > 0.1;
      const payment = await Payment.create({
        orderId,
        customerId,
        amount,
        currency: currency || 'USD',
        method,
        status: isSuccess ? 'COMPLETED' : 'FAILED',
        transactionRef: 'TXN-' + uuidv4().slice(0, 8).toUpperCase(),
      });
      const statusCode = payment.status === 'COMPLETED' ? 201 : 402;
      res.status(statusCode).json({
        success: payment.status === 'COMPLETED',
        message: payment.status === 'COMPLETED' ? 'Payment processed successfully' : 'Payment failed',
        data: payment,
      });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
  },

  refundPayment: async (req, res) => {
    try {
      const payment = await Payment.findById(req.params.id);
      if (!payment) {
        return res.status(404).json({ success: false, message: 'Payment not found' });
      }
      if (payment.status !== 'COMPLETED') {
        return res.status(400).json({ success: false, message: 'Only completed payments can be refunded' });
      }
      payment.status = 'REFUNDED';
      payment.refundedAt = new Date();
      await payment.save();
      res.json({ success: true, message: 'Payment refunded successfully', data: payment });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
  },
};

module.exports = PaymentController;
