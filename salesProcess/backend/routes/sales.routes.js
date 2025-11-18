const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// Get all sales
router.get('/', async (req, res) => {
  try {
    const sales = await prisma.sale.findMany();
    res.json(sales);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single sale
router.get('/:id', async (req, res) => {
  try {
    const sale = await prisma.sale.findUnique({
      where: { id: parseInt(req.params.id) }
    });
    
    if (!sale) {
      return res.status(404).json({ error: 'Sale not found' });
    }
    
    res.json(sale);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/sales - Create new sale
router.post('/', async (req, res) => {
  try {
    const { filterType, fanType, ductSystem, extractionVolume, volumeFlow, processId } = req.body;
    
    if (!processId) {
      return res.status(400).json({ error: 'processId is required' });
    }
    
    const sale = await prisma.sale.create({
      data: {
        filterType,
        fanType,
        ductSystem,
        extractionVolume,
        volumeFlow,
        processId
      },
      include: {
        process: true
      }
    });
    
    res.status(201).json(sale);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/sales/:id - Update sale
router.put('/:id', async (req, res) => {
  try {
    const { filterType, fanType, ductSystem, extractionVolume, volumeFlow, processId } = req.body;
    
    const sale = await prisma.sale.update({
      where: { id: parseInt(req.params.id) },
      data: {
        filterType,
        fanType,
        ductSystem,
        extractionVolume,
        volumeFlow,
        ...(processId !== undefined && { processId })
      },
      include: {
        process: true
      }
    });
    
    res.json(sale);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/sales/:id - Delete sale
router.delete('/:id', async (req, res) => {
  try {
    await prisma.sale.delete({
      where: { id: parseInt(req.params.id) }
    });
    
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;