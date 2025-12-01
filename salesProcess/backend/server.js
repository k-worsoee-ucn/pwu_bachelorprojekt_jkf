const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

// Import routes
const processRoutes = require('./routes/process.routes');
const salesRoutes = require('./routes/sales.routes');
const customerRoutes = require('./routes/customer.routes');
const userRoutes = require('./routes/user.routes');
const productRoutes = require('./routes/product.routes');
const referenceRoutes = require('./routes/reference.routes');
const caseRoutes = require('./routes/case.routes');

const app = express();
const PORT = process.env.PORT || 3000;

const prisma = new PrismaClient();

app.use(helmet());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: { error: 'Too many requests' }
});

app.use('/api/', limiter);

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Sales Process API is running!' });
});

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/processes', processRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/references', referenceRoutes);
app.use('/api/cases', caseRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error:', err);
  
  // Don't leak error details in production
  if (process.env.NODE_ENV === 'production') {
    res.status(500).json({ error: 'Internal server error' });
  } else {
    res.status(500).json({ error: err.message, stack: err.stack });
  }
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Prisma Client initialized');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});