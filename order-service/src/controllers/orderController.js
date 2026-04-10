const axios = require('axios');
const Order = require('../models/orderModel');

const VALID_STATUSES = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

// Product Service base URL — reads from env so it works both locally and in Docker/cloud
const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL || 'http://localhost:3001';

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

      //  Step 1: Validate stock for ALL items before creating the order 
      const stockErrors = [];

      for (const item of items) {
        if (!item.productId || !item.quantity || item.quantity < 1) {
          return res.status(400).json({
            success: false,
            message: 'Each item must have a valid productId and quantity >= 1',
          });
        }

        try {
          const { data: productRes } = await axios.get(
            `${PRODUCT_SERVICE_URL}/products/${item.productId}`
          );
          const product = productRes.data;

          if (product.stock < item.quantity) {
            stockErrors.push({
              productId: item.productId,
              productName: product.name,
              availableStock: product.stock,
              requestedQuantity: item.quantity,
            });
          }
        } catch (err) {
          // Product not found in product-service
          if (err.response && err.response.status === 404) {
            return res.status(404).json({
              success: false,
              message: `Product with ID "${item.productId}" not found in Product Service`,
            });
          }
          return res.status(503).json({
            success: false,
            message: 'Product Service is unavailable. Please try again later.',
            error: err.message,
          });
        }
      }

      // If any items have insufficient stock, reject the entire order
      if (stockErrors.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'Insufficient stock for one or more items. Order cannot be placed.',
          insufficientItems: stockErrors,
        });
      }

      // Step 2: Create the order
      const totalAmount = parseFloat(
        items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0).toFixed(2)
      );
      const order = await Order.create({ customerId, items, totalAmount, shippingAddress });

      // Step 3: Deduct stock from product-service for each item 
      
      const stockDeductErrors = [];

      for (const item of items) {
        try {
          await axios.patch(
            `${PRODUCT_SERVICE_URL}/products/${item.productId}/stock`,
            { quantity: item.quantity }
          );
        } catch (err) {
          stockDeductErrors.push({
            productId: item.productId,
            reason: err.response?.data?.message || err.message,
          });
        }
      }

      if (stockDeductErrors.length > 0) {
        // Order is placed but stock deduction had issues — return warning
        return res.status(201).json({
          success: true,
          message: 'Order placed, but some stock deductions failed. Please review manually.',
          data: order,
          stockDeductWarnings: stockDeductErrors,
        });
      }

      res.status(201).json({ success: true, message: 'Order placed successfully', data: order });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
  },

  updateOrderStatus: async (req, res) => {
    try {
      const { status } = req.body;
      if (!status || !VALID_STATUSES.includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Status must be one of: ${VALID_STATUSES.join(', ')}`,
        });
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
