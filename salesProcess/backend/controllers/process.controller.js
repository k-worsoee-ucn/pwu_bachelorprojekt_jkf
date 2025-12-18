const prisma = require("./prisma");

async function getAllProcesses(req, res) {
  try {
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
    });
    res.json(processes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function getProcessById(req, res) {
  try {
    const process = await prisma.process.findUnique({
      where: { id: parseInt(req.params.id) },
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

    if (!process) return res.status(404).json({ error: "Process not found" });

    res.json(process);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function updateProcess(req, res) {
  try {
    const processId = parseInt(req.params.id);
    const { title, caseNo, status, consent, currentStep, shippingDate } =
      req.body;

    // Build update data object, only including fields that are provided
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (caseNo !== undefined) updateData.caseNo = caseNo;
    if (status !== undefined) updateData.status = status;
    if (consent !== undefined) updateData.consent = consent;
    if (currentStep !== undefined) updateData.currentStep = currentStep;
    if (shippingDate !== undefined) updateData.shippingDate = shippingDate;

    const process = await prisma.process.update({
      where: { id: processId },
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
    res.json(process);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function deleteProcess(req, res) {
  try {
    await prisma.process.delete({ where: { id: parseInt(req.params.id) } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function getFilterOptions(req, res) {
  try {
    // Get all sales managers
    const salesManagers = await prisma.user.findMany({
      where: { role: "salesManager" },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    });

    // Industry enum values
    const industries = [
      "Woodworking",
      "Agro and Milling",
      "Recycling",
      "Metalworking",
      "Paper",
      "Other",
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
    const customers = customersRaw.map((c) => c.name);

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

    res.json({
      salesManagers,
      industries,
      countries,
      customers,
      filterTypes,
      fanTypes,
    });
  } catch (error) {
    console.error("Filter options error:", error);
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  getAllProcesses,
  getProcessById,
  updateProcess,
  deleteProcess,
  getFilterOptions,
};
