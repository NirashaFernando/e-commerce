# E-Commerce Microservices - IT4020 Assignment 2

## Architecture Overview

```
Client
  │
  ▼
API Gateway (Port 3000)
  ├── /api/products  → Product Service  (Port 3001)
  ├── /api/customers → Customer Service (Port 3002)
  ├── /api/orders    → Order Service    (Port 3003)
  └── /api/payments  → Payment Service  (Port 3004)
```

## Group Members & Microservices
| Member | Microservice | Port |
|--------|-------------|------|
| Member 1 | Product Service | 3001 |
| Member 2 | Customer Service | 3002 |
| Member 3 | Order Service | 3003 |
| Member 4 | Payment Service | 3004 |
| All | API Gateway | 3000 |

## Setup & Run

### Step 1: Install dependencies for all services
```bash
cd product-service  && npm install && cd ..
cd customer-service && npm install && cd ..
cd order-service    && npm install && cd ..
cd payment-service  && npm install && cd ..
cd api-gateway      && npm install && cd ..
```

### Step 2: Start each service in a separate terminal

**Terminal 1 - Product Service:**
```bash
cd product-service && npm start
```

**Terminal 2 - Customer Service:**
```bash
cd customer-service && npm start
```

**Terminal 3 - Order Service:**
```bash
cd order-service && npm start
```

**Terminal 4 - Payment Service:**
```bash
cd payment-service && npm start
```

**Terminal 5 - API Gateway:**
```bash
cd api-gateway && npm start
```

## Swagger Docs (Native URLs)
- Product Service:  http://localhost:3001/api-docs
- Customer Service: http://localhost:3002/api-docs
- Order Service:    http://localhost:3003/api-docs
- Payment Service:  http://localhost:3004/api-docs

## Via API Gateway (Single Port!)
- Product Service:  http://localhost:3000/api/products
- Customer Service: http://localhost:3000/api/customers
- Order Service:    http://localhost:3000/api/orders
- Payment Service:  http://localhost:3000/api/payments
- Gateway Swagger:  http://localhost:3000/api-docs
