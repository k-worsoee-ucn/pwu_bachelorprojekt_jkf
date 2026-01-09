const prisma = require("../utils/prisma");
const encryption = require("../utils/encryption");

// Helper function to decrypt process data
function decryptProcess(process) {
  if (!process) return process;

  // Decrypt endUser from sale
  if (process.sale && process.sale.endUser) {
    process.sale.endUser = encryption.decrypt(process.sale.endUser);
  }

  // Decrypt salesManager name
  if (process.sale && process.sale.salesManager && process.sale.salesManager.name) {
    process.sale.salesManager.name = encryption.decrypt(process.sale.salesManager.name);
  }

  // Decrypt customer name and website
  if (process.sale && process.sale.customer) {
    if (process.sale.customer.name) {
      process.sale.customer.name = encryption.decrypt(process.sale.customer.name);
    }
    if (process.sale.customer.website) {
      process.sale.customer.website = encryption.decrypt(process.sale.customer.website);
    }
  }

  // Decrypt processUsers names
  if (process.processUsers && process.processUsers.length > 0) {
    process.processUsers = process.processUsers.map(pu => ({
      ...pu,
      user: pu.user && pu.user.name ? {
        ...pu.user,
        name: encryption.decrypt(pu.user.name)
      } : pu.user
    }));
  }

  return process;
}

async function getAllProcesses() {
  const processes = await prisma.process.findMany({
    select: {
      id: true,
      title: true,
      caseNo: true,
      status: true,
      currentStep: true,
      consent: true,
      shippingDate: true,
      createdAt: true,
      updatedAt: true,
      sale: {
        include: {
          saleProducts: {
            include: {
              product: true,
            },
          },
          customer: true,
          salesManager: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return processes;
}

async function getProcessById(processId) {
  const process = await prisma.process.findUnique({
    where: { id: parseInt(processId) },
    include: {
      sale: {
        include: {
          saleProducts: {
            include: {
              product: true,
            },
          },
          customer: true,
          salesManager: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
      },
      processUsers: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
      },
    },
  });

  if (!process) {
    throw { status: 404, message: "Process not found" };
  }

  return decryptProcess(process);
}

async function updateProcess(processId, updateFields) {
  const { title, caseNo, status, consent, currentStep, shippingDate } = updateFields;

  // Build update data object, only including fields that are provided
  const updateData = {};
  if (title !== undefined) updateData.title = title;
  if (caseNo !== undefined) updateData.caseNo = caseNo;
  if (status !== undefined) updateData.status = status;
  if (consent !== undefined) updateData.consent = consent;
  if (currentStep !== undefined) updateData.currentStep = currentStep;
  if (shippingDate !== undefined) updateData.shippingDate = shippingDate;

  const process = await prisma.process.update({
    where: { id: parseInt(processId) },
    data: updateData,
    include: {
      sale: {
        include: {
          saleProducts: {
            include: {
              product: true,
            },
          },
          customer: true,
          salesManager: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
      },
    },
  });

  return process;
}

async function deleteProcess(processId) {
  await prisma.process.delete({
    where: { id: parseInt(processId) }
  });
}

async function getFilterOptions() {
  // Get all sales managers
  const salesManagersRaw = await prisma.user.findMany({
    where: { role: "salesManager" },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
  const salesManagers = salesManagersRaw.map((user) => ({
    id: user.id,
    name: encryption.decrypt(user.name),
  }));

  // Industry enum values (must match the enum in schema)
  const industries = [
    "woodworking",
    "agroAndMilling",
    "recycling",
    "metalworking",
    "paper",
    "other",
  ];

  // Get distinct countries from Sales
  const countriesRaw = await prisma.sale.findMany({
    select: { country: true },
  });
  const countries = [...new Set(countriesRaw.map((s) => s.country))].sort();

  // Get distinct customers
  const customersRaw = await prisma.customer.findMany({
    select: { name: true },
    orderBy: { name: "asc" },
  });
  const customers = [...new Set(customersRaw.map((c) => encryption.decrypt(c.name)))].sort();

  // Get distinct product categories for filters (filtersAndSeparators)
  const filterProductsRaw = await prisma.product.findMany({
    where: { category: "filtersAndSeparators" },
    select: { title: true },
    orderBy: { title: "asc" },
  });
  const filterTypes = [...new Set(filterProductsRaw.map((p) => p.title))];

  // Get distinct product categories for ventilation (fanSystems)
  const fanProductsRaw = await prisma.product.findMany({
    where: { category: "fanSystems" },
    select: { title: true },
    orderBy: { title: "asc" },
  });
  const fanTypes = [...new Set(fanProductsRaw.map((p) => p.title))];

  return {
    salesManagers,
    industries,
    countries,
    customers,
    filterTypes,
    fanTypes,
  };
}

module.exports = {
  getAllProcesses,
  getProcessById,
  updateProcess,
  deleteProcess,
  getFilterOptions,
};
