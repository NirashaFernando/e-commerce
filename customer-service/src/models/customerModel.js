const { v4: uuidv4 } = require('uuid');

let customers = [
  {
    id: uuidv4(),
    firstName: 'Amal',
    lastName: 'Perera',
    email: 'amal.perera@email.com',
    phone: '+94771234567',
    address: '12 Galle Road, Colombo 03',
    createdAt: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    firstName: 'Nimal',
    lastName: 'Silva',
    email: 'nimal.silva@email.com',
    phone: '+94779876543',
    address: '45 Kandy Road, Peradeniya',
    createdAt: new Date().toISOString(),
  },
];

const CustomerModel = {
  getAll: () => customers,

  getById: (id) => customers.find((c) => c.id === id),

  getByEmail: (email) => customers.find((c) => c.email === email),

  create: (data) => {
    const customer = { id: uuidv4(), ...data, createdAt: new Date().toISOString() };
    customers.push(customer);
    return customer;
  },

  update: (id, data) => {
    const index = customers.findIndex((c) => c.id === id);
    if (index === -1) return null;
    customers[index] = { ...customers[index], ...data, updatedAt: new Date().toISOString() };
    return customers[index];
  },

  delete: (id) => {
    const index = customers.findIndex((c) => c.id === id);
    if (index === -1) return false;
    customers.splice(index, 1);
    return true;
  },
};

module.exports = CustomerModel;
