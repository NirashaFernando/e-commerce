const CustomerModel = require('../models/customerModel');

const CustomerController = {
  getAllCustomers: (req, res) => {
    const customers = CustomerModel.getAll();
    res.json({ success: true, count: customers.length, data: customers });
  },

  getCustomerById: (req, res) => {
    const customer = CustomerModel.getById(req.params.id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }
    res.json({ success: true, data: customer });
  },

  createCustomer: (req, res) => {
    const { firstName, lastName, email, phone, address } = req.body;
    if (!firstName || !lastName || !email) {
      return res.status(400).json({ success: false, message: 'firstName, lastName, and email are required' });
    }
    if (CustomerModel.getByEmail(email)) {
      return res.status(409).json({ success: false, message: 'Customer with this email already exists' });
    }
    const customer = CustomerModel.create({ firstName, lastName, email, phone, address });
    res.status(201).json({ success: true, message: 'Customer created', data: customer });
  },

  updateCustomer: (req, res) => {
    const customer = CustomerModel.update(req.params.id, req.body);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }
    res.json({ success: true, message: 'Customer updated', data: customer });
  },

  deleteCustomer: (req, res) => {
    const deleted = CustomerModel.delete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }
    res.json({ success: true, message: 'Customer deleted' });
  },
};

module.exports = CustomerController;
