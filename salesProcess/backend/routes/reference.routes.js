const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// Get all references
router.get('/', async (req, res) => {
  try {
    const { processId } = req.query;
    
    const whereClause = {};
    if (processId) whereClause.processId = parseInt(processId);
    
    const references = await prisma.reference.findMany({
      where: whereClause,
      include: {
        process: true,
        products: true,
        cases: true
      }
    });
    
    res.json(references);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single reference
router.get('/:id', async (req, res) => {
  try {
    const reference = await prisma.reference.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        process: true,
        products: true,
        cases: true
      }
    });
    
    if (!reference) {
      return res.status(404).json({ error: 'Reference not found' });
    }
    
    res.json(reference);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new reference
router.post('/', async (req, res) => {
  try {
    const { processId } = req.body;
    
    const reference = await prisma.reference.create({
      data: {
        ...(processId && { processId })
      },
      include: {
        process: true
      }
    });
    
    res.status(201).json(reference);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update reference
router.put('/:id', async (req, res) => {
  try {
    const { processId } = req.body;
    
    const reference = await prisma.reference.update({
      where: { id: parseInt(req.params.id) },
      data: {
        ...(processId !== undefined && { processId })
      },
      include: {
        process: true
      }
    });
    
    res.json(reference);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete reference
router.delete('/:id', async (req, res) => {
  try {
    await prisma.reference.delete({
      where: { id: parseInt(req.params.id) }
    });
    
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;