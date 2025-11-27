const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// Get all users
router.get('/', async (req, res) => {
  try {
    const { role } = req.query;
    
    const whereClause = {};
    if (role) whereClause.role = role;
    
    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    });
    
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single user
router.get('/:id', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(req.params.id) },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        processUsers: {
          include: {
            process: true
          }
        },
        ownedSales: {
          include: {
            customer: true,
            process: true
          }
        },
        managedCustomers: true
      }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new user
router.post('/', async (req, res) => {
  try {
    const { username, email, password, name, role } = req.body;
    
    if (!username || !email || !password || !name) {
      return res.status(400).json({ 
        error: 'username, email, password, and name are required' 
      });
    }
    
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password,
        name,
        role: role || 'viewer'
      },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      }
    });
    
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user
router.put('/:id', async (req, res) => {
  try {
    const { username, email, name, role } = req.body;
    // Note: Password updates should be handled separately with proper hashing
    
    const user = await prisma.user.update({
      where: { id: parseInt(req.params.id) },
      data: {
        ...(username && { username }),
        ...(email && { email }),
        ...(name && { name }),
        ...(role && { role })
      },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        role: true,
        updatedAt: true
      }
    });
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete user
router.delete('/:id', async (req, res) => {
  try {
    await prisma.user.delete({
      where: { id: parseInt(req.params.id) }
    });
    
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user's assigned processes
router.get('/:id/processes', async (req, res) => {
  try {
    const processUsers = await prisma.processUser.findMany({
      where: { 
        userId: parseInt(req.params.id),
        isActive: true 
      },
      include: {
        process: {
          include: {
            sale: true
          }
        }
      }
    });
    
    res.json(processUsers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user's managed customers (for sales managers)
router.get('/:id/customers', async (req, res) => {
  try {
    const customers = await prisma.customer.findMany({
      where: { salesManagerId: parseInt(req.params.id) },
      include: {
        sales: true
      }
    });
    
    res.json(customers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user's owned sales
router.get('/:id/sales', async (req, res) => {
  try {
    const sales = await prisma.sale.findMany({
      where: { salesManagerId: parseInt(req.params.id) },
      include: {
        customer: true,
        process: true,
        saleProducts: {
          include: {
            product: true
          }
        }
      }
    });
    
    res.json(sales);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;