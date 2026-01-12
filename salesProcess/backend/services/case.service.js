const prisma = require("../utils/prisma");

async function getAllCases() {
  const cases = await prisma.case.findMany({
    include: {
      process: true,
      reference: true,
    },
  });

  return cases;
}

async function getCaseById(caseId) {
  const caseItem = await prisma.case.findUnique({
    where: { id: parseInt(caseId) },
    include: { process: true, reference: true },
  });

  if (!caseItem) {
    throw { status: 404, message: "Case not found" };
  }

  return caseItem;
}

async function getCasesByProcessId(processId) {
  const cases = await prisma.case.findMany({
    where: { processId: parseInt(processId) },
    include: {
      process: true,
      reference: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return cases;
}

async function createCase(caseData) {
  const { content, processId, referenceId } = caseData;

  if (!content) {
    throw { status: 400, message: "content is required" };
  }

  const dataToCreate = {
    content,
  };

  if (processId) {
    dataToCreate.processId = parseInt(processId);
  }

  if (referenceId) {
    dataToCreate.referenceId = parseInt(referenceId);
  }

  const caseItem = await prisma.case.create({
    data: dataToCreate,
    include: { process: true, reference: true },
  });

  return caseItem;
}

async function updateCase(caseId, updateData) {
  const { content, processId, referenceId } = updateData;

  const caseItem = await prisma.case.update({
    where: { id: parseInt(caseId) },
    data: {
      ...(content && { content }),
      ...(processId !== undefined && { processId: parseInt(processId) }),
      ...(referenceId !== undefined && {
        referenceId: parseInt(referenceId),
      }),
    },
    include: { process: true, reference: true },
  });

  return caseItem;
}

async function deleteCase(caseId) {
  const existingCase = await prisma.case.findUnique({
    where: { id: parseInt(caseId) },
  });

  if (!existingCase) {
    throw { status: 404, message: "Case not found" };
  }

  await prisma.case.delete({
    where: { id: parseInt(caseId) },
  });

  return { message: "Case deleted successfully" };
}

module.exports = {
  getAllCases,
  getCaseById,
  getCasesByProcessId,
  createCase,
  updateCase,
  deleteCase,
};
