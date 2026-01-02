const prisma = require("./prisma");

async function getAllReferences(req, res) {
  try {
    const { processId } = req.query;

    const whereClause = {};
    if (processId) whereClause.processId = parseInt(processId);

    const references = await prisma.reference.findMany({
      where: whereClause,
      include: { process: true, products: true, cases: true },
    });

    res.json(references);
  } catch (error) {
    console.error('Error in getAllReferences:', error);
    res.status(500).json({ error: 'An error occurred processing your request' });
  }
}

async function getReferenceById(req, res) {
  try {
    const reference = await prisma.reference.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { process: true, products: true, cases: true },
    });

    if (!reference)
      return res.status(404).json({ error: "Reference not found" });

    res.json(reference);
  } catch (error) {
    console.error('Error in getReferenceById:', error);
    res.status(500).json({ error: 'An error occurred processing your request' });
  }
}

async function createReference(req, res) {
  try {
    const { processId } = req.body;
    const reference = await prisma.reference.create({
      data: { ...(processId && { processId }) },
      include: { process: true },
    });

    res.status(201).json(reference);
  } catch (error) {
    console.error('Error in createReference:', error);
    res.status(500).json({ error: 'An error occurred processing your request' });
  }
}

async function updateReference(req, res) {
  try {
    const { processId } = req.body;
    const reference = await prisma.reference.update({
      where: { id: parseInt(req.params.id) },
      data: { ...(processId !== undefined && { processId }) },
      include: { process: true },
    });

    res.json(reference);
  } catch (error) {
    console.error('Error in updateReference:', error);
    res.status(500).json({ error: 'An error occurred processing your request' });
  }
}

async function deleteReference(req, res) {
  try {
    await prisma.reference.delete({ where: { id: parseInt(req.params.id) } });
    res.status(204).send();
  } catch (error) {
    console.error('Error in deleteReference:', error);
    res.status(500).json({ error: 'An error occurred processing your request' });
  }
}

module.exports = {
  getAllReferences,
  getReferenceById,
  createReference,
  updateReference,
  deleteReference,
};
