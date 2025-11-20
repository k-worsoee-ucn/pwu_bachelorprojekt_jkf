const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

// Import routes
const processRoutes = require('./routes/process.routes');
const salesRoutes = require('./routes/sales.routes');

const app = express();
const PORT = process.env.PORT || 3000;

const prisma = new PrismaClient();

// Middleware
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