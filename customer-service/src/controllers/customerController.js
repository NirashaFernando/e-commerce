const Customer = require('../models/customerModel');

const CustomerController = {
  getAllCustomers: async (req, res) => {
    try {
      const customers = await Customer.find();
      res.json({ success: true, count: customers.length, data: customers });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
  },

  getCustomerById: async (req, res) => {
    try {
      const customer = await Customer.findById(req.params.id);
      if (!customer) {
        return res.status(404).json({ success: false, message: 'Customer not found' });
      }
      res.json({ success: true, data: customer });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
  },

  createCustomer: async (req, res) => {
    try {
      const { firstName, lastName, email, phone, address } = req.body;
      if (!firstName || !lastName || !email) {
        return res.status(400).json({ success: false, message: 'firstName, lastName, and email are required' });
      }
      const existing = await Customer.findOne({ email });
      if (existing) {
        return res.status(409).json({ success: false, message: 'Customer with this email already exists' });
      }
      const customer = await Customer.create({ firstName, lastName, email, phone, address });
      res.status(201).json({ success: true, message: 'Customer created', data: customer });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
  },

  updateCustomer: async (req, res) => {
    try {
      const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
      if (!customer) {
        return res.status(404).json({ success: false, message: 'Customer not found' });
      }
      res.json({ success: true, message: 'Customer updated', data: customer });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
  },

  deleteCustomer: async (req, res) => {
    try {
      const customer = await Customer.findByIdAndDelete(req.params.id);
      if (!customer) {
        return res.status(404).json({ success: false, message: 'Customer not found' });
      }
      res.json({ success: true, message: 'Customer deleted' });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
  },
};

module.exports = CustomerController;
