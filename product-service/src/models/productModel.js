const { v4: uuidv4 } = require('uuid');

// In-memory data store
let products = [
  {
    id: uuidv4(),
    name: 'Wireless Headphones',
    description: 'Premium noise-cancelling wireless headphones',
    price: 149.99,
    category: 'Electronics',
    stock: 50,
    createdAt: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    name: 'Running Shoes',
    description: 'Lightweight and durable running shoes',
    price: 89.99,
    category: 'Footwear',
    stock: 120,
    createdAt: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    name: 'Coffee Maker',
    description: 'Automatic drip coffee maker with 12-cup capacity',
    price: 59.99,
    category: 'Kitchen',
    stock: 35,
    createdAt: new Date().toISOString(),
  },
];

const ProductModel = {
  getAll: () => products,

  getById: (id) => products.find((p) => p.id === id),

  create: (data) => {
    const product = {
      id: uuidv4(),
      ...data,
      createdAt: new Date().toISOString(),
    };
    products.push(product);
    return product;
  },

  update: (id, data) => {
    const index = products.findIndex((p) => p.id === id);
    if (index === -1) return null;
    products[index] = { ...products[index], ...data, updatedAt: new Date().toISOString() };
    return products[index];
  },

  delete: (id) => {
    const index = products.findIndex((p) => p.id === id);
    if (index === -1) return false;
    products.splice(index, 1);
    return true;
  },
};

module.exports = ProductModel;
