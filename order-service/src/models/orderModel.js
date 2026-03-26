const { v4: uuidv4 } = require('uuid');

let orders = [
  {
    id: uuidv4(),
    customerId: 'sample-customer-id-1',
    items: [
      { productId: 'sample-product-id-1', productName: 'Wireless Headphones', quantity: 1, unitPrice: 149.99 },
    ],
    totalAmount: 149.99,
    status: 'DELIVERED',
    shippingAddress: '12 Galle Road, Colombo 03',
    createdAt: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    customerId: 'sample-customer-id-2',
    items: [
      { productId: 'sample-product-id-2', productName: 'Running Shoes', quantity: 2, unitPrice: 89.99 },
      { productId: 'sample-product-id-3', productName: 'Coffee Maker', quantity: 1, unitPrice: 59.99 },
    ],
    totalAmount: 239.97,
    status: 'PROCESSING',
    shippingAddress: '45 Kandy Road, Peradeniya',
    createdAt: new Date().toISOString(),
  },
];

const OrderModel = {
  getAll: () => orders,

  getById: (id) => orders.find((o) => o.id === id),

  getByCustomerId: (customerId) => orders.filter((o) => o.customerId === customerId),

  create: (data) => {
    const totalAmount = data.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const order = {
      id: uuidv4(),
      ...data,
      totalAmount: parseFloat(totalAmount.toFixed(2)),
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };
    orders.push(order);
    return order;
  },

  updateStatus: (id, status) => {
    const index = orders.findIndex((o) => o.id === id);
    if (index === -1) return null;
    orders[index] = { ...orders[index], status, updatedAt: new Date().toISOString() };
    return orders[index];
  },

  delete: (id) => {
    const index = orders.findIndex((o) => o.id === id);
    if (index === -1) return false;
    orders.splice(index, 1);
    return true;
  },
};

module.exports = OrderModel;
