const Order = require('../models/orderModel');

const VALID_STATUSES = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

const OrderController = {
  getAllOrders: async (req, res) => {
    try {
      const orders = await Order.find();
      res.json({ success: true, count: orders.length, data: orders });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
  },

  getOrderById: async (req, res) => {
    try {
      const order = await Order.findById(req.params.id);
      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }
      res.json({ success: true, data: order });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
  },

  getOrdersByCustomer: async (req, res) => {
    try {
      const orders = await Order.find({ customerId: req.params.customerId });
      res.json({ success: true, count: orders.length, data: orders });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
  },

  createOrder: async (req, res) => {
    try {
      const { customerId, items, shippingAddress } = req.body;
      if (!customerId || !items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ success: false, message: 'customerId and items array are required' });
      }
      const totalAmount = parseFloat(
        items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0).toFixed(2)
      );
      const order = await Order.create({ customerId, items, totalAmount, shippingAddress });
      res.status(201).json({ success: true, message: 'Order placed', data: order });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
  },

  updateOrderStatus: async (req, res) => {
    try {
      const { status } = req.body;
      if (!status || !VALID_STATUSES.includes(status)) {
        return res.status(400).json({ success: false, message: `Status must be one of: ${VALID_STATUSES.join(', ')}` });
      }
      const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }
      res.json({ success: true, message: 'Order status updated', data: order });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
  },

  deleteOrder: async (req, res) => {
    try {
      const order = await Order.findByIdAndDelete(req.params.id);
      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }
      res.json({ success: true, message: 'Order deleted' });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
  },
};

module.exports = OrderController;
