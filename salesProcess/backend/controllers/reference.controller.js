const referenceService = require("../services/reference.service");

async function getAllReferences(req, res) {
  try {
    const { processId } = req.query;

    const references = await referenceService.getAllReferences({ processId });

    res.json(references);
  } catch (error) {
    console.error('Error in getAllReferences:', error);
    res.status(500).json({ error: 'An error occurred processing your request' });
  }
}

async function getReferenceById(req, res) {
  try {
    const reference = await referenceService.getReferenceById(req.params.id);
    res.json(reference);
  } catch (error) {
    console.error('Error in getReferenceById:', error);
    const statusCode = error.status || 500;
    const message = error.message || 'An error occurred processing your request';
    res.status(statusCode).json({ error: message });
  }
}

async function createReference(req, res) {
  try {
    const { processId } = req.body;
    const reference = await referenceService.createReference({ processId });

    res.status(201).json(reference);
  } catch (error) {
    console.error('Error in createReference:', error);
    const statusCode = error.status || 500;
    const message = error.message || 'An error occurred processing your request';
    res.status(statusCode).json({ error: message });
  }
}

async function updateReference(req, res) {
  try {
    const { processId } = req.body;
    const reference = await referenceService.updateReference(req.params.id, { processId });
    res.json(reference);
  } catch (error) {
    console.error('Error in updateReference:', error);
    const statusCode = error.status || 500;
    const message = error.message || 'An error occurred processing your request';
    res.status(statusCode).json({ error: message });
  }
}

async function deleteReference(req, res) {
  try {
    await referenceService.deleteReference(req.params.id);
    res.status(204).send();
  } catch (error) {
    console.error('Error in deleteReference:', error);
    const statusCode = error.status || 500;
    const message = error.message || 'An error occurred processing your request';
    res.status(statusCode).json({ error: message });
  }
}

module.exports = {
  getAllReferences,
  getReferenceById,
  createReference,
  updateReference,
  deleteReference,
};
