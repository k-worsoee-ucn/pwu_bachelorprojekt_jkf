const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// Get all processes
router.get('/', async (req, res) => {
  try {
    const processes = await prisma.process.findMany({
      include: {
        sale: true
      }
    });
    res.json(processes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single process
router.get('/:id', async (req, res) => {
  try {
    const process = await prisma.process.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        sale: true
      }
    });
    
    if (!process) {
      return res.status(404).json({ error: 'Process not found' });
    }
    
    res.json(process);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new process
router.post('/', async (req, res) => {
  try {
    const { title, caseNo, status } = req.body;
    
    const process = await prisma.process.create({
      data: {
        title,
        caseNo,
        status
      },
      include: {
        sale: true
      }
    });
    
    res.status(201).json(process);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update process
router.put('/:id', async (req, res) => {
  try {
    const { title, caseNo, status } = req.body;
    
    const process = await prisma.process.update({
      where: { id: parseInt(req.params.id) },
      data: {
        title,
        caseNo,
        status
      },
      include: {
        sale: true
      }
    });
    
    res.json(process);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete process
router.delete('/:id', async (req, res) => {
  try {
    await prisma.process.delete({
      where: { id: parseInt(req.params.id) }
    });
    
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
