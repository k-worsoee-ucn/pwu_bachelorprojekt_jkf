const prisma = require("../utils/prisma");

async function getCasesByProcessId(processId) {
  const cases = await prisma.case.findMany({
    where: { processId: parseInt(processId) },
    include: {
      process: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return cases;
}

async function createCase(caseData) {
  const { content, processId } = caseData;

  if (!content) {
    throw { status: 400, message: "content is required" };
  }

  const dataToCreate = {
    content,
  };

  if (processId) {
    dataToCreate.processId = parseInt(processId);
  }

  const caseItem = await prisma.case.create({
    data: dataToCreate,
    include: { process: true },
  });

  return caseItem;
}

async function updateCase(caseId, updateData) {
  const { content, processId } = updateData;

  const caseItem = await prisma.case.update({
    where: { id: parseInt(caseId) },
    data: {
      ...(content && { content }),
      ...(processId !== undefined && { processId: parseInt(processId) }),
    },
    include: { process: true },
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
  getCasesByProcessId,
  createCase,
  updateCase,
  deleteCase,
};
