const prisma = require("./prisma");

async function getAllProcesses(req, res) {
  try {
    const processes = await prisma.process.findMany({
      include: { sale: true },
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
    const { title, caseNo, status } = req.body;
    const process = await prisma.process.update({
      where: { id: parseInt(req.params.id) },
      data: { title, caseNo, status },
      include: { sale: true },
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

module.exports = {
  getAllProcesses,
  getProcessById,
  updateProcess,
  deleteProcess,
};
