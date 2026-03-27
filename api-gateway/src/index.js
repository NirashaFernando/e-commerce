const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { createProxyMiddleware } = require('http-proxy-middleware');
const swaggerUi = require('swagger-ui-express');

const app = express();
const PORT = 3000;

// ─────────────────────────────────────────────
// Middleware
// ─────────────────────────────────────────────
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

// ─────────────────────────────────────────────
// Service Registry for all services
// ─────────────────────────────────────────────
const SERVICES = {
  product:  { url: 'http://localhost:3001', prefix: '/products' },
  customer: { url: 'http://localhost:3002', prefix: '/customers' },
  order:    { url: 'http://localhost:3003', prefix: '/orders' },
  payment:  { url: 'http://localhost:3004', prefix: '/payments' },
};

// ─────────────────────────────────────────────
// Request Logger Middleware
// ─────────────────────────────────────────────
app.use((req, res, next) => {
  console.log(`[API Gateway] ${new Date().toISOString()} → ${req.method} ${req.path}`);
  next();
});

// ─────────────────────────────────────────────
// Proxy Routes - All services through ONE port
// ─────────────────────────────────────────────
app.use(
  '/api/products',
  createProxyMiddleware({
    target: SERVICES.product.url,
    changeOrigin: true,
    pathRewrite: { '^/api/products': '/products' },
    on: {
      error: (err, req, res) => {
        res.status(503).json({ success: false, message: 'Product Service unavailable', error: err.message });
      },
    },
  })
);

app.use(
  '/api/customers',
  createProxyMiddleware({
    target: SERVICES.customer.url,
    changeOrigin: true,
    pathRewrite: { '^/api/customers': '/customers' },
    on: {
      error: (err, req, res) => {
        res.status(503).json({ success: false, message: 'Customer Service unavailable', error: err.message });
      },
    },
  })
);

app.use(
  '/api/orders',
  createProxyMiddleware({
    target: SERVICES.order.url,
    changeOrigin: true,
    pathRewrite: { '^/api/orders': '/orders' },
    on: {
      error: (err, req, res) => {
        res.status(503).json({ success: false, message: 'Order Service unavailable', error: err.message });
      },
    },
  })
);

app.use(
  '/api/payments',
  createProxyMiddleware({
    target: SERVICES.payment.url,
    changeOrigin: true,
    pathRewrite: { '^/api/payments': '/payments' },
    on: {
      error: (err, req, res) => {
        res.status(503).json({ success: false, message: 'Payment Service unavailable', error: err.message });
      },
    },
  })
);

// ─────────────────────────────────────────────
// Gateway-level Swagger Docs
// ─────────────────────────────────────────────
const gatewaySwaggerDoc = {
  openapi: '3.0.0',
  info: {
    title: 'E-Commerce API Gateway',
    version: '1.0.0',
    description: `
## E-Commerce Microservices — API Gateway

This gateway provides a **single entry point (Port 3000)** to all microservices.
All services are accessible without needing to know individual service ports.

| Service | Direct URL | Via Gateway |
|---|---|---|
| Product Service | http://localhost:3001/api-docs | http://localhost:3000/api/products |
| Customer Service | http://localhost:3002/api-docs | http://localhost:3000/api/customers |
| Order Service | http://localhost:3003/api-docs | http://localhost:3000/api/orders |
| Payment Service | http://localhost:3004/api-docs | http://localhost:3000/api/payments |
    `,
  },
  servers: [{ url: 'http://localhost:3000', description: 'API Gateway' }],
  paths: {
    '/api/products': {
      get: { tags: ['Product Service'], summary: 'Get all products', responses: { 200: { description: 'OK' } } },
      post: { tags: ['Product Service'], summary: 'Create a product',
        requestBody: { content: { 'application/json': { schema: { example: { name: 'Wireless Mouse', description: 'Ergonomic mouse', price: 29.99, category: 'Electronics', stock: 100 } } } } },
        responses: { 201: { description: 'Created' } } },
    },
    '/api/products/{id}': {
      get: { tags: ['Product Service'], summary: 'Get product by ID', parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'OK' }, 404: { description: 'Not Found' } } },
      put: { tags: ['Product Service'], summary: 'Update a product', parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Updated' } } },
      delete: { tags: ['Product Service'], summary: 'Delete a product', parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Deleted' } } },
    },
    '/api/customers': {
      get: { tags: ['Customer Service'], summary: 'Get all customers', responses: { 200: { description: 'OK' } } },
      post: { tags: ['Customer Service'], summary: 'Register a customer',
        requestBody: { content: { 'application/json': { schema: { example: { firstName: 'Kasun', lastName: 'Fernando', email: 'kasun@email.com', phone: '+94771234567', address: '10 Flower Road, Colombo 07' } } } } },
        responses: { 201: { description: 'Created' } } },
    },
    '/api/customers/{id}': {
      get: { tags: ['Customer Service'], summary: 'Get customer by ID', parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'OK' } } },
      put: { tags: ['Customer Service'], summary: 'Update a customer', parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Updated' } } },
      delete: { tags: ['Customer Service'], summary: 'Delete a customer', parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Deleted' } } },
    },
    '/api/orders': {
      get: { tags: ['Order Service'], summary: 'Get all orders', responses: { 200: { description: 'OK' } } },
      post: { tags: ['Order Service'], summary: 'Place a new order',
        requestBody: { content: { 'application/json': { schema: { example: { customerId: 'abc-123', items: [{ productId: 'prod-1', productName: 'Headphones', quantity: 1, unitPrice: 149.99 }], shippingAddress: '22 Main Street, Colombo 01' } } } } },
        responses: { 201: { description: 'Created' } } },
    },
    '/api/orders/{id}': {
      get: { tags: ['Order Service'], summary: 'Get order by ID', parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'OK' } } },
      delete: { tags: ['Order Service'], summary: 'Delete an order', parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Deleted' } } },
    },
    '/api/orders/{id}/status': {
      patch: { tags: ['Order Service'], summary: 'Update order status', parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        requestBody: { content: { 'application/json': { schema: { example: { status: 'SHIPPED' } } } } },
        responses: { 200: { description: 'Updated' } } },
    },
    '/api/payments': {
      get: { tags: ['Payment Service'], summary: 'Get all payments', responses: { 200: { description: 'OK' } } },
      post: { tags: ['Payment Service'], summary: 'Process a payment',
        requestBody: { content: { 'application/json': { schema: { example: { orderId: 'order-abc', customerId: 'cust-xyz', amount: 149.99, currency: 'USD', method: 'CREDIT_CARD' } } } } },
        responses: { 201: { description: 'Payment processed' } } },
    },
    '/api/payments/{id}': {
      get: { tags: ['Payment Service'], summary: 'Get payment by ID', parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'OK' } } },
    },
    '/api/payments/{id}/refund': {
      patch: { tags: ['Payment Service'], summary: 'Refund a payment', parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Refunded' } } },
    },
  },
};

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(gatewaySwaggerDoc));

// ─────────────────────────────────────────────
// Health Check & Service Status
// ─────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    service: 'API Gateway',
    status: 'UP',
    port: PORT,
    timestamp: new Date().toISOString(),
    routes: {
      products:  `http://localhost:${PORT}/api/products`,
      customers: `http://localhost:${PORT}/api/customers`,
      orders:    `http://localhost:${PORT}/api/orders`,
      payments:  `http://localhost:${PORT}/api/payments`,
    },
  });
});

app.get('/', (req, res) => {
  res.json({
    message: '🛒 E-Commerce API Gateway',
    version: '1.0.0',
    docs: `http://localhost:${PORT}/api-docs`,
    endpoints: {
      products:  `/api/products`,
      customers: `/api/customers`,
      orders:    `/api/orders`,
      payments:  `/api/payments`,
    },
  });
});

// ─────────────────────────────────────────────
// 404 Handler
// ─────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.path} not found on gateway` });
});

app.listen(PORT, () => {
  console.log(`\n🚀 API Gateway running on http://localhost:${PORT}`);
  console.log(`📄 Gateway Swagger: http://localhost:${PORT}/api-docs`);
  console.log(`\n📡 Routing table:`);
  console.log(`   /api/products  → http://localhost:3001`);
  console.log(`   /api/customers → http://localhost:3002`);
  console.log(`   /api/orders    → http://localhost:3003`);
  console.log(`   /api/payments  → http://localhost:3004\n`);
});
