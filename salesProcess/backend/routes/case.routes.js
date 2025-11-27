const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// Get all cases
router.get('/', async (req, res) => {
  try {
    const { processId, referenceId } = req.query;
    
    const whereClause = {};
    if (processId) whereClause.processId = parseInt(processId);
    if (referenceId) whereClause.referenceId = parseInt(referenceId);
    
    const cases = await prisma.case.findMany({
      where: whereClause,
      include: {
        process: true,
        reference: true,
        products: true
      }
    });
    
    res.json(cases);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single case
router.get('/:id', async (req, res) => {
  try {
    const caseItem = await prisma.case.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        process: true,
        reference: true,
        products: true
      }
    });
    
    if (!caseItem) {
      return res.status(404).json({ error: 'Case not found' });
    }
    
    res.json(caseItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new case
router.post('/', async (req, res) => {
  try {
    const { content, processId, referenceId } = req.body;
    
    if (!content) {
      return res.status(400).json({ error: 'content is required' });
    }
    
    const caseItem = await prisma.case.create({
      data: {
        content,
        ...(processId && { processId }),
        ...(referenceId && { referenceId })
      },
      include: {
        process: true,
        reference: true
      }
    });
    
    res.status(201).json(caseItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update case
router.put('/:id', async (req, res) => {
  try {
    const { content, processId, referenceId } = req.body;
    
    const caseItem = await prisma.case.update({
      where: { id: parseInt(req.params.id) },
      data: {
        ...(content && { content }),
        ...(processId !== undefined && { processId }),
        ...(referenceId !== undefined && { referenceId })
      },
      include: {
        process: true,
        reference: true
      }
    });
    
    res.json(caseItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete case
router.delete('/:id', async (req, res) => {
  try {
    await prisma.case.delete({
      where: { id: parseInt(req.params.id) }
    });
    
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;