const { v4: uuidv4 } = require('uuid');

let payments = [
  {
    id: uuidv4(),
    orderId: 'sample-order-id-1',
    customerId: 'sample-customer-id-1',
    amount: 149.99,
    currency: 'USD',
    method: 'CREDIT_CARD',
    status: 'COMPLETED',
    transactionRef: 'TXN-' + uuidv4().slice(0, 8).toUpperCase(),
    createdAt: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    orderId: 'sample-order-id-2',
    customerId: 'sample-customer-id-2',
    amount: 239.97,
    currency: 'USD',
    method: 'PAYPAL',
    status: 'PENDING',
    transactionRef: 'TXN-' + uuidv4().slice(0, 8).toUpperCase(),
    createdAt: new Date().toISOString(),
  },
];

const PaymentModel = {
  getAll: () => payments,

  getById: (id) => payments.find((p) => p.id === id),

  getByOrderId: (orderId) => payments.find((p) => p.orderId === orderId),

  getByCustomerId: (customerId) => payments.filter((p) => p.customerId === customerId),

  create: (data) => {
    // Simulate payment processing - 90% success rate
    const isSuccess = Math.random() > 0.1;
    const payment = {
      id: uuidv4(),
      ...data,
      status: isSuccess ? 'COMPLETED' : 'FAILED',
      transactionRef: 'TXN-' + uuidv4().slice(0, 8).toUpperCase(),
      createdAt: new Date().toISOString(),
    };
    payments.push(payment);
    return payment;
  },

  refund: (id) => {
    const index = payments.findIndex((p) => p.id === id);
    if (index === -1) return null;
    if (payments[index].status !== 'COMPLETED') return { error: 'Only completed payments can be refunded' };
    payments[index] = {
      ...payments[index],
      status: 'REFUNDED',
      refundedAt: new Date().toISOString(),
    };
    return payments[index];
  },
};

module.exports = PaymentModel;
