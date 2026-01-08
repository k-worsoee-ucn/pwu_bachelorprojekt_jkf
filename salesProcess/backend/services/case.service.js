const prisma = require("../controllers/prisma");

async function getAllCases(processId = null, referenceId = null) {
  const whereClause = {};
  if (processId) whereClause.processId = parseInt(processId);
  if (referenceId) whereClause.referenceId = parseInt(referenceId);

  const cases = await prisma.case.findMany({
    where: whereClause,
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

  console.log("Creating case with data:", dataToCreate);

  const caseItem = await prisma.case.create({
    data: dataToCreate,
    include: { process: true, reference: true },
  });

  console.log(`Created case: ${caseItem.id}`);

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

  console.log(`Updated case: ${caseId}`);

  return caseItem;
}

async function deleteCase(caseId) {
  await prisma.case.delete({
    where: { id: parseInt(caseId) },
  });

  console.log(`Deleted case: ${caseId}`);
}

module.exports = {
  getAllCases,
  getCaseById,
  getCasesByProcessId,
  createCase,
  updateCase,
  deleteCase,
};
