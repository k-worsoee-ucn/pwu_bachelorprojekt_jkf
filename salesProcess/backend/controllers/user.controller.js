const prisma = require("./prisma");

async function getAllUsers(req, res) {
  try {
    const { role } = req.query;
    const whereClause = {};
    if (role) whereClause.role = role;

    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function getUserById(req, res) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(req.params.id) },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        processUsers: { include: { process: true } },
        ownedSales: { include: { customer: true, process: true } },
        managedCustomers: true,
      },
    });

    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function createUser(req, res) {
  try {
    const { username, email, password, name, role } = req.body;
    if (!username || !email || !password || !name) {
      return res
        .status(400)
        .json({ error: "username, email, password, and name are required" });
    }

    const user = await prisma.user.create({
      data: { username, email, password, name, role: role || "viewer" },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function updateUser(req, res) {
  try {
    const { username, email, name, role } = req.body;
    const user = await prisma.user.update({
      where: { id: parseInt(req.params.id) },
      data: {
        ...(username && { username }),
        ...(email && { email }),
        ...(name && { name }),
        ...(role && { role }),
      },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        role: true,
        updatedAt: true,
      },
    });

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function deleteUser(req, res) {
  try {
    await prisma.user.delete({ where: { id: parseInt(req.params.id) } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function getUserProcesses(req, res) {
  try {
    const processUsers = await prisma.processUser.findMany({
      where: { userId: parseInt(req.params.id), isActive: true },
      include: { process: { include: { sale: true } } },
    });

    res.json(processUsers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function getUserCustomers(req, res) {
  try {
    const customers = await prisma.customer.findMany({
      where: { salesManagerId: parseInt(req.params.id) },
      include: { sales: true },
    });

    res.json(customers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function getUserSales(req, res) {
  try {
    const sales = await prisma.sale.findMany({
      where: { salesManagerId: parseInt(req.params.id) },
      include: {
        customer: true,
        process: true,
        saleProducts: { include: { product: true } },
      },
    });

    res.json(sales);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getUserProcesses,
  getUserCustomers,
  getUserSales,
};
