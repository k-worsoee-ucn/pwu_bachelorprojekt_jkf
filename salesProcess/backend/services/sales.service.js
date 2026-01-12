const prisma = require("../utils/prisma");
const encryption = require("../utils/encryption");

// Decrypt sale data
function decryptSale(sale) {
  if (!sale) return sale;

  const decrypted = {
    ...sale,
    endUser: sale.endUser ? encryption.decrypt(sale.endUser) : null,
  };

  // Decrypt salesManager name if present
  if (decrypted.salesManager && decrypted.salesManager.name) {
    decrypted.salesManager = {
      ...decrypted.salesManager,
      name: encryption.decrypt(decrypted.salesManager.name),
    };
  }

  return decrypted;
}

async function createSale(saleData) {
  const {
    // Basic Information
    title,
    endUser,
    phoneNumber,
    country,
    industry,
    customIndustry,
    customerId,
    salesManagerId,
    // Product Selection
    selectedFilters = [],
    selectedFans = [],
    selectedDucts = [],
    // Technical Specifications
    plantType,
    filterType,
    fanType,
    dustType,
    ductSystem,
    totalExtractionVolume,
    pressure,
    volumeFlow,
    description,
    privacySettings,
  } = saleData;

  if (!title || !endUser || !country || !industry || !customerId || !salesManagerId) {
    throw {
      status: 400,
      message: "Required fields: title, endUser, country, industry, customerId, salesManagerId",
    };
  }

  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
    select: { name: true },
  });

  if (!customer) {
    throw { status: 400, message: "Customer not found" };
  }

  const salesManager = await prisma.user.findUnique({
    where: { id: salesManagerId },
    select: { id: true },
  });

  if (!salesManager) {
    throw { status: 400, message: "Sales manager not found" };
  }

  const lastProcess = await prisma.process.findFirst({
    orderBy: { caseNo: "desc" },
    select: { caseNo: true },
  });
  const nextCaseNo = (lastProcess?.caseNo || 0) + 1;

  const allSelectedProducts = [
    ...selectedFilters,
    ...selectedFans,
    ...selectedDucts,
  ].filter((id) => id);

  const result = await prisma.$transaction(async (prisma) => {
    const process = await prisma.process.create({
      data: {
        title: title,
        caseNo: nextCaseNo,
        status: "ongoing",
        currentStep: 2,
      },
    });

    const encryptedEndUser = encryption.encrypt(endUser);
    const sale = await prisma.sale.create({
      data: {
        title: title,
        description: description || null,
        endUser: encryptedEndUser,
        phoneNumber: phoneNumber || null,
        country,
        industry,
        customIndustry: industry === "other" ? customIndustry : null,
        plantType,
        filterType,
        fanType,
        dustType,
        ductSystem,
        totalExtractionVolume: parseInt(totalExtractionVolume),
        pressure: parseInt(pressure),
        volumeFlow: parseInt(volumeFlow),
        privacySettings: privacySettings || null,
        processId: process.id,
        customerId,
        salesManagerId,
      },
    });

    if (allSelectedProducts.length > 0) {
      const saleProductData = allSelectedProducts.map((productId) => ({
        saleId: sale.id,
        productId: parseInt(productId),
        quantity: 1,
      }));

      await prisma.saleProduct.createMany({
        data: saleProductData,
      });
    }

    return await prisma.sale.findUnique({
      where: { id: sale.id },
      include: {
        process: true,
        customer: true,
        salesManager: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        saleProducts: {
          include: {
            product: true,
          },
        },
      },
    });
  });

  return decryptSale(result);
}

async function updateSale(saleId, updateData) {
  const {
    selectedFilters = [],
    selectedFans = [],
    selectedDucts = [],
    processId,
    salesManagerId,
    ...dbUpdateData
  } = updateData;

  const allSelectedProducts = [
    ...selectedFilters,
    ...selectedFans,
    ...selectedDucts,
  ].filter((id) => id);

  const existingSale = await prisma.sale.findUnique({
    where: { id: parseInt(saleId) },
  });

  if (!existingSale) {
    throw { status: 404, message: "Sale not found" };
  }

  const sale = await prisma.$transaction(async (prisma) => {
    await prisma.sale.update({
      where: { id: parseInt(saleId) },
      data: dbUpdateData,
    });

    await prisma.saleProduct.deleteMany({
      where: { saleId: parseInt(saleId) },
    });

    if (allSelectedProducts.length > 0) {
      const saleProductData = allSelectedProducts.map((productId) => ({
        saleId: parseInt(saleId),
        productId: parseInt(productId),
        quantity: 1,
      }));

      await prisma.saleProduct.createMany({
        data: saleProductData,
      });
    }

    return await prisma.sale.findUnique({
      where: { id: parseInt(saleId) },
      include: {
        process: true,
        customer: true,
        salesManager: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        saleProducts: {
          include: {
            product: true,
          },
        },
      },
    });
  });

  return decryptSale(sale);
}

module.exports = {
  createSale,
  updateSale,
};
