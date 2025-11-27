const prisma = require("./prisma");

async function getAllSales(req, res) {
  try {
    const sales = await prisma.sale.findMany();
    res.json(sales);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function getSaleById(req, res) {
  try {
    const sale = await prisma.sale.findUnique({
      where: { id: parseInt(req.params.id) },
    });
    if (!sale) return res.status(404).json({ error: "Sale not found" });
    res.json(sale);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function createSale(req, res) {
  try {
    const {
      filterType,
      fanType,
      ductSystem,
      extractionVolume,
      volumeFlow,
      processId,
    } = req.body;
    if (!processId)
      return res.status(400).json({ error: "processId is required" });

    const sale = await prisma.sale.create({
      data: {
        filterType,
        fanType,
        ductSystem,
        extractionVolume,
        volumeFlow,
        processId,
      },
      include: { process: true },
    });

    res.status(201).json(sale);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function updateSale(req, res) {
  try {
    const {
      filterType,
      fanType,
      ductSystem,
      extractionVolume,
      volumeFlow,
      processId,
    } = req.body;
    const sale = await prisma.sale.update({
      where: { id: parseInt(req.params.id) },
      data: {
        filterType,
        fanType,
        ductSystem,
        extractionVolume,
        volumeFlow,
        ...(processId !== undefined && { processId }),
      },
      include: { process: true },
    });

    res.json(sale);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function deleteSale(req, res) {
  try {
    await prisma.sale.delete({ where: { id: parseInt(req.params.id) } });
    res.status(204).send();
  } catch (error) {
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
