const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const customerRoutes = require('./routes/customerRoutes');

const app = express();
const PORT = 3002;

app.use(cors());
app.use(express.json());

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Customer Service API',
      version: '1.0.0',
      description: 'Microservice for managing e-commerce customers',
    },
    servers: [{ url: `http://localhost:${PORT}` }],
  },
  apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/customers', customerRoutes);

app.get('/health', (req, res) => {
  res.json({ service: 'Customer Service', status: 'UP', port: PORT });
});

app.listen(PORT, () => {
  console.log(`✅ Customer Service running on http://localhost:${PORT}`);
  console.log(`📄 Swagger docs: http://localhost:${PORT}/api-docs`);
});
