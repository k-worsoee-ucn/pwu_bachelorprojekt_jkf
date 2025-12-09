const prisma = require("./prisma");

async function getAllSales(req, res) {
  try {
    const sales = await prisma.sale.findMany({
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
    res.json(sales);
  } catch (error) {
    console.error("Error fetching sales:", error);
    res.status(500).json({ error: error.message });
  }
}

async function getSaleById(req, res) {
  try {
    const sale = await prisma.sale.findUnique({
      where: { id: parseInt(req.params.id) },
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

    if (!sale) {
      return res.status(404).json({ error: "Sale not found" });
    }

    res.json(sale);
  } catch (error) {
    console.error("Error fetching sale:", error);
    res.status(500).json({ error: error.message });
  }
}

async function createSale(req, res) {
  try {
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
      volumeFlow,
    } = req.body;

    if (
      !title ||
      !endUser ||
      !country ||
      !industry ||
      !customerId ||
      !salesManagerId
    ) {
      return res.status(400).json({
        error:
          "Required fields: title, endUser, country, industry, customerId, salesManagerId",
      });
    }

    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      select: { name: true },
    });

    if (!customer) {
      return res.status(400).json({ error: "Customer not found" });
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

      const sale = await prisma.sale.create({
        data: {
          title: title,
          endUser,
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
          volumeFlow: parseInt(volumeFlow),
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

    console.log(`Created sale and process: ${title} (Case #${nextCaseNo})`);
    res.status(201).json(result);
  } catch (error) {
    console.error("Error creating sale:", error);
    res.status(500).json({ error: error.message });
  }
}

async function updateSale(req, res) {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const sale = await prisma.sale.update({
      where: { id: parseInt(id) },
      data: updateData,
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

    res.json(sale);
  } catch (error) {
    console.error("Error updating sale:", error);
    res.status(500).json({ error: error.message });
  }
}

async function deleteSale(req, res) {
  try {
    const { id } = req.params;

    await prisma.$transaction(async (prisma) => {
      await prisma.saleProduct.deleteMany({
        where: { saleId: parseInt(id) },
      });

      await prisma.sale.delete({
        where: { id: parseInt(id) },
      });
    });

    res.status(204).send();
  } catch (error) {
    console.error("Error deleting sale:", error);
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  getAllSales,
  getSaleById,
  createSale,
  updateSale,
  deleteSale,
};
