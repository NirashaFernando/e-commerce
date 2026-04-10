const Product = require('../models/productModel');

const ProductController = {
  getAllProducts: async (req, res) => {
    try {
      const products = await Product.find();
      res.json({ success: true, count: products.length, data: products });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
  },

  getProductById: async (req, res) => {
    try {
      const product = await Product.findById(req.params.id);
      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }
      res.json({ success: true, data: product });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
  },

  createProduct: async (req, res) => {
    try {
      const { name, description, price, category, stock } = req.body;
      if (!name || !price) {
        return res.status(400).json({ success: false, message: 'Name and price are required' });
      }
      const product = await Product.create({ name, description, price, category, stock: stock || 0 });
      res.status(201).json({ success: true, message: 'Product created', data: product });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
  },

  updateProduct: async (req, res) => {
    try {
      const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }
      res.json({ success: true, message: 'Product updated', data: product });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
  },

  deleteProduct: async (req, res) => {
    try {
      const product = await Product.findByIdAndDelete(req.params.id);
      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }
      res.json({ success: true, message: 'Product deleted' });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
  },

  // Internal endpoint — called by order-service to deduct stock after an order is placed
  reduceStock: async (req, res) => {
    try {
      const { quantity } = req.body;
      if (!quantity || quantity < 1) {
        return res.status(400).json({ success: false, message: 'quantity must be a positive integer' });
      }

      // Atomically deduct only if stock is sufficient (stock >= quantity)
      const product = await Product.findOneAndUpdate(
        { _id: req.params.id, stock: { $gte: quantity } },
        { $inc: { stock: -quantity } },
        { new: true }
      );

      if (!product) {
        // Either product not found or stock was insufficient
        const exists = await Product.findById(req.params.id);
        if (!exists) {
          return res.status(404).json({ success: false, message: 'Product not found' });
        }
        return res.status(409).json({
          success: false,
          message: `Insufficient stock. Available: ${exists.stock}, Requested: ${quantity}`,
          availableStock: exists.stock,
        });
      }

      res.json({ success: true, message: 'Stock updated', data: product });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
  },
};

module.exports = ProductController;
