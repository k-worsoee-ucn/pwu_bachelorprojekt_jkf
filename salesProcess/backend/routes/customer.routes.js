const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// Get all customers
router.get('/', async (req, res) => {
  try {
    const { industry, country, salesManagerId } = req.query;
    
    const whereClause = {};
    if (industry) whereClause.industry = industry;
    if (country) whereClause.country = country;
    if (salesManagerId) whereClause.salesManagerId = parseInt(salesManagerId);
    
    const customers = await prisma.customer.findMany({
      where: whereClause,
      include: {
        salesManager: true,
        sales: true
      }
    });
    
    res.json(customers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single customer
router.get('/:id', async (req, res) => {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        salesManager: true,
        sales: {
          include: {
            process: true
          }
        }
      }
    });
    
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    res.json(customer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new customer
router.post('/', async (req, res) => {
  try {
    const { name, industry, country, salesManagerId } = req.body;
    
    if (!name || !industry || !country || !salesManagerId) {
      return res.status(400).json({ 
        error: 'name, industry, country, and salesManagerId are required' 
      });
    }
    
    const customer = await prisma.customer.create({
      data: {
        name,
        industry,
        country,
        salesManagerId
      },
      include: {
        salesManager: true
      }
    });
    
    res.status(201).json(customer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update customer
router.put('/:id', async (req, res) => {
  try {
    const { name, industry, country, salesManagerId } = req.body;
    
    const customer = await prisma.customer.update({
      where: { id: parseInt(req.params.id) },
      data: {
        ...(name && { name }),
        ...(industry && { industry }),
        ...(country && { country }),
        ...(salesManagerId && { salesManagerId })
      },
      include: {
        salesManager: true
      }
    });
    
    res.json(customer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete customer
router.delete('/:id', async (req, res) => {
  try {
    await prisma.customer.delete({
      where: { id: parseInt(req.params.id) }
    });
    
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get customer sales
router.get('/:id/sales', async (req, res) => {
  try {
    const sales = await prisma.sale.findMany({
      where: { customerId: parseInt(req.params.id) },
      include: {
        process: true,
        salesManager: true,
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