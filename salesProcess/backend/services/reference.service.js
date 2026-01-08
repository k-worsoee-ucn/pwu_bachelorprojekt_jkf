const prisma = require("../controllers/prisma");

async function getAllReferences(queryParams = {}) {
  const { processId } = queryParams;

  const whereClause = {};
  if (processId) whereClause.processId = parseInt(processId);

  const references = await prisma.reference.findMany({
    where: whereClause,
    include: { process: true, cases: true },
  });

  return references;
}

async function getReferenceById(referenceId) {
  const reference = await prisma.reference.findUnique({
    where: { id: parseInt(referenceId) },
    include: { process: true, cases: true },
  });

  if (!reference) {
    throw { status: 404, message: "Reference not found" };
  }

  return reference;
}

async function createReference(referenceData) {
  const { processId } = referenceData;

  if (processId) {
    const process = await prisma.process.findUnique({
      where: { id: parseInt(processId) }
    });
    if (!process) {
      throw { status: 404, message: "Process not found" };
    }
  }

  const reference = await prisma.reference.create({
    data: { ...(processId && { processId: parseInt(processId) }) },
    include: { process: true },
  });

  return reference;
}

async function updateReference(referenceId, updateFields) {
  const { processId } = updateFields;

  const reference = await prisma.reference.findUnique({
    where: { id: parseInt(referenceId) }
  });

  if (!reference) {
    throw { status: 404, message: "Reference not found" };
  }

  if (processId) {
    const process = await prisma.process.findUnique({
      where: { id: parseInt(processId) }
    });
    if (!process) {
      throw { status: 404, message: "Process not found" };
    }
  }

  const updated = await prisma.reference.update({
    where: { id: parseInt(referenceId) },
    data: { ...(processId !== undefined && { processId: parseInt(processId) }) },
    include: { process: true },
  });

  return updated;
}

async function deleteReference(referenceId) {
  const reference = await prisma.reference.findUnique({
    where: { id: parseInt(referenceId) }
  });

  if (!reference) {
    throw { status: 404, message: "Reference not found" };
  }

  await prisma.reference.delete({
    where: { id: parseInt(referenceId) }
  });
}

module.exports = {
  getAllReferences,
  getReferenceById,
  createReference,
  updateReference,
  deleteReference,
};
