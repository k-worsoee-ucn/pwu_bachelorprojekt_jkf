const prisma = require("./prisma");

async function getAllCases(req, res) {
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
        products: true,
      },
    });

    res.json(cases);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function getCaseById(req, res) {
  try {
    const caseItem = await prisma.case.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { process: true, reference: true, products: true },
    });

    if (!caseItem) return res.status(404).json({ error: "Case not found" });

    res.json(caseItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function createCase(req, res) {
  try {
    const { content, processId, referenceId } = req.body;

    if (!content) return res.status(400).json({ error: "content is required" });

    const caseItem = await prisma.case.create({
      data: {
        content,
        ...(processId && { processId }),
        ...(referenceId && { referenceId }),
      },
      include: { process: true, reference: true },
    });

    res.status(201).json(caseItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function updateCase(req, res) {
  try {
    const { content, processId, referenceId } = req.body;

    const caseItem = await prisma.case.update({
      where: { id: parseInt(req.params.id) },
      data: {
        ...(content && { content }),
        ...(processId !== undefined && { processId }),
        ...(referenceId !== undefined && { referenceId }),
      },
      include: { process: true, reference: true },
    });

    res.json(caseItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function deleteCase(req, res) {
  try {
    await prisma.case.delete({ where: { id: parseInt(req.params.id) } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  getAllCases,
  getCaseById,
  createCase,
  updateCase,
  deleteCase,
};
