const OrderModel = require('../models/orderModel');

const VALID_STATUSES = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

const OrderController = {
  getAllOrders: (req, res) => {
    const orders = OrderModel.getAll();
    res.json({ success: true, count: orders.length, data: orders });
  },

  getOrderById: (req, res) => {
    const order = OrderModel.getById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.json({ success: true, data: order });
  },

  getOrdersByCustomer: (req, res) => {
    const orders = OrderModel.getByCustomerId(req.params.customerId);
    res.json({ success: true, count: orders.length, data: orders });
  },

  createOrder: (req, res) => {
    const { customerId, items, shippingAddress } = req.body;
    if (!customerId || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'customerId and items array are required' });
    }
    const order = OrderModel.create({ customerId, items, shippingAddress });
    res.status(201).json({ success: true, message: 'Order placed', data: order });
  },

  updateOrderStatus: (req, res) => {
    const { status } = req.body;
    if (!status || !VALID_STATUSES.includes(status)) {
      return res.status(400).json({ success: false, message: `Status must be one of: ${VALID_STATUSES.join(', ')}` });
    }
    const order = OrderModel.updateStatus(req.params.id, status);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.json({ success: true, message: 'Order status updated', data: order });
  },

  deleteOrder: (req, res) => {
    const deleted = OrderModel.delete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.json({ success: true, message: 'Order deleted' });
  },
};

module.exports = OrderController;
