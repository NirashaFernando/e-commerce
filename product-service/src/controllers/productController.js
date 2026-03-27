const ProductModel = require('../models/productModel');

const ProductController = {
  getAllProducts: (req, res) => {
    const products = ProductModel.getAll();
    res.json({ success: true, count: products.length, data: products });
  },

  getProductById: (req, res) => {
    const product = ProductModel.getById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, data: product });
  },

  createProduct: (req, res) => {
    const { name, description, price, category, stock } = req.body;
    if (!name || !price) {
      return res.status(400).json({ success: false, message: 'Name and price are required' });
    }
    const product = ProductModel.create({ name, description, price, category, stock: stock || 0 });
    res.status(201).json({ success: true, message: 'Product created', data: product });
  },

  updateProduct: (req, res) => {
    const product = ProductModel.update(req.params.id, req.body);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, message: 'Product updated', data: product });
  },

  deleteProduct: (req, res) => {
    const deleted = ProductModel.delete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, message: 'Product deleted' });
  },
};

module.exports = ProductController;
