/**
 * Seed script — inserts 4 sample documents into each Atlas database.
 * Run with: node seed.js  (from product-service folder)
 */

const mongoose = require('mongoose');

const ATLAS_BASE = 'mongodb+srv://nirasharosh_db_user:Nirasha1234@cluster0.9eyfrhk.mongodb.net';
const APP_NAME   = 'appName=Cluster0';

// ── Schemas ────────────────────────────────────────────────────────────────
const productSchema  = new mongoose.Schema({ name: String, description: String, price: Number, category: String, stock: Number }, { timestamps: true });
const customerSchema = new mongoose.Schema({ firstName: String, lastName: String, email: String, phone: String, address: String }, { timestamps: true });
const orderItemSchema = new mongoose.Schema({ productId: String, productName: String, quantity: Number, unitPrice: Number }, { _id: false });
const orderSchema    = new mongoose.Schema({ customerId: String, items: [orderItemSchema], totalAmount: Number, status: String, shippingAddress: String }, { timestamps: true });
const paymentSchema  = new mongoose.Schema({ orderId: String, customerId: String, amount: Number, currency: String, method: String, status: String, transactionRef: String }, { timestamps: true });

// ── Seed data ──────────────────────────────────────────────────────────────
const products = [
  { name: 'Wireless Headphones', description: 'Premium noise-cancelling wireless headphones',     price: 149.99, category: 'Electronics', stock: 50  },
  { name: 'Running Shoes',       description: 'Lightweight and durable running shoes',             price: 89.99,  category: 'Footwear',     stock: 120 },
  { name: 'Coffee Maker',        description: 'Automatic drip coffee maker with 12-cup capacity', price: 59.99,  category: 'Kitchen',      stock: 35  },
  { name: 'Smart Watch',         description: 'Fitness tracking smartwatch with heart rate monitor', price: 199.99, category: 'Electronics', stock: 75 },
];

const customers = [
  { firstName: 'Amal',   lastName: 'Perera',      email: 'amal.perera@email.com',   phone: '+94771234567', address: '12 Galle Road, Colombo 03' },
  { firstName: 'Nimal',  lastName: 'Silva',       email: 'nimal.silva@email.com',   phone: '+94779876543', address: '45 Kandy Road, Peradeniya'  },
  { firstName: 'Kumari', lastName: 'Jayawardena', email: 'kumari.j@email.com',      phone: '+94712345678', address: '78 Negombo Road, Wattala'   },
  { firstName: 'Ruwan',  lastName: 'Fernando',    email: 'ruwan.f@email.com',       phone: '+94723456789', address: '23 Marine Drive, Galle'     },
];

const orders = [
  { customerId: 'cust-001', items: [{ productId: 'prod-001', productName: 'Wireless Headphones', quantity: 1, unitPrice: 149.99 }],                                                                                  totalAmount: 149.99, status: 'DELIVERED',  shippingAddress: '12 Galle Road, Colombo 03' },
  { customerId: 'cust-002', items: [{ productId: 'prod-002', productName: 'Running Shoes', quantity: 2, unitPrice: 89.99 }, { productId: 'prod-003', productName: 'Coffee Maker', quantity: 1, unitPrice: 59.99 }], totalAmount: 239.97, status: 'PROCESSING', shippingAddress: '45 Kandy Road, Peradeniya'  },
  { customerId: 'cust-003', items: [{ productId: 'prod-004', productName: 'Smart Watch', quantity: 1, unitPrice: 199.99 }],                                                                                          totalAmount: 199.99, status: 'CONFIRMED',  shippingAddress: '78 Negombo Road, Wattala'   },
  { customerId: 'cust-004', items: [{ productId: 'prod-001', productName: 'Wireless Headphones', quantity: 2, unitPrice: 149.99 }],                                                                                  totalAmount: 299.98, status: 'PENDING',    shippingAddress: '23 Marine Drive, Galle'     },
];

const payments = [
  { orderId: 'order-001', customerId: 'cust-001', amount: 149.99, currency: 'USD', method: 'CREDIT_CARD',   status: 'COMPLETED', transactionRef: 'TXN-A1B2C3D4' },
  { orderId: 'order-002', customerId: 'cust-002', amount: 239.97, currency: 'USD', method: 'PAYPAL',        status: 'COMPLETED', transactionRef: 'TXN-E5F6G7H8' },
  { orderId: 'order-003', customerId: 'cust-003', amount: 199.99, currency: 'USD', method: 'DEBIT_CARD',    status: 'PENDING',   transactionRef: 'TXN-I9J0K1L2' },
  { orderId: 'order-004', customerId: 'cust-004', amount: 299.98, currency: 'USD', method: 'BANK_TRANSFER', status: 'COMPLETED', transactionRef: 'TXN-M3N4O5P6' },
];

// ── Helper ─────────────────────────────────────────────────────────────────
async function seedCollection(uri, modelName, schema, data) {
  const conn = await mongoose.createConnection(uri).asPromise();
  const Model = conn.model(modelName, schema);
  await Model.deleteMany({});
  const inserted = await Model.insertMany(data);
  console.log(`✅ ${modelName}: inserted ${inserted.length} documents into ${uri.split('/').pop().split('?')[0]}`);
  await conn.close();
}

// ── Run ────────────────────────────────────────────────────────────────────
(async () => {
  try {
    console.log('🌱 Seeding all databases on MongoDB Atlas...\n');
    await Promise.all([
      seedCollection(`${ATLAS_BASE}/product-db?${APP_NAME}`,  'Product',  productSchema,  products),
      seedCollection(`${ATLAS_BASE}/customer-db?${APP_NAME}`, 'Customer', customerSchema, customers),
      seedCollection(`${ATLAS_BASE}/order-db?${APP_NAME}`,    'Order',    orderSchema,    orders),
      seedCollection(`${ATLAS_BASE}/payment-db?${APP_NAME}`,  'Payment',  paymentSchema,  payments),
    ]);
    console.log('\n🎉 All databases seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
    process.exit(1);
  }
})();
