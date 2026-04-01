const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const paymentRoutes = require('./routes/paymentRoutes');

const app = express();
const PORT = 3004;

app.use(cors());
app.use(express.json());

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Payment Service API',
      version: '1.0.0',
      description: 'Microservice for processing e-commerce payments',
    },
    servers: [{ url: `http://localhost:${PORT}` }],
  },
  apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/payments', paymentRoutes);

app.get('/health', (req, res) => {
  res.json({ service: 'Payment Service', status: 'UP', port: PORT });
});

app.listen(PORT, () => {
  console.log(`✅ Payment Service running on http://localhost:${PORT}`);
  console.log(`📄 Swagger docs: http://localhost:${PORT}/api-docs`);
});
