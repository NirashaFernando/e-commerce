const PaymentModel = require('../models/paymentModel');

const VALID_METHODS = ['CREDIT_CARD', 'DEBIT_CARD', 'PAYPAL', 'BANK_TRANSFER', 'CASH_ON_DELIVERY'];

const PaymentController = {
  getAllPayments: (req, res) => {
    const payments = PaymentModel.getAll();
    res.json({ success: true, count: payments.length, data: payments });
  },

  getPaymentById: (req, res) => {
    const payment = PaymentModel.getById(req.params.id);
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }
    res.json({ success: true, data: payment });
  },

  getPaymentByOrder: (req, res) => {
    const payment = PaymentModel.getByOrderId(req.params.orderId);
    if (!payment) {
      return res.status(404).json({ success: false, message: 'No payment found for this order' });
    }
    res.json({ success: true, data: payment });
  },

  getPaymentsByCustomer: (req, res) => {
    const payments = PaymentModel.getByCustomerId(req.params.customerId);
    res.json({ success: true, count: payments.length, data: payments });
  },

  processPayment: (req, res) => {
    const { orderId, customerId, amount, currency, method } = req.body;
    if (!orderId || !customerId || !amount || !method) {
      return res.status(400).json({ success: false, message: 'orderId, customerId, amount, and method are required' });
    }
    if (!VALID_METHODS.includes(method)) {
      return res.status(400).json({ success: false, message: `Method must be one of: ${VALID_METHODS.join(', ')}` });
    }
    const payment = PaymentModel.create({ orderId, customerId, amount, currency: currency || 'USD', method });
    const statusCode = payment.status === 'COMPLETED' ? 201 : 402;
    res.status(statusCode).json({
      success: payment.status === 'COMPLETED',
      message: payment.status === 'COMPLETED' ? 'Payment processed successfully' : 'Payment failed',
      data: payment,
    });
  },

  refundPayment: (req, res) => {
    const result = PaymentModel.refund(req.params.id);
    if (!result) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }
    if (result.error) {
      return res.status(400).json({ success: false, message: result.error });
    }
    res.json({ success: true, message: 'Payment refunded successfully', data: result });
  },
};

module.exports = PaymentController;
