const prisma = require("./prisma");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

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

async function updateCurrentUser(req, res) {
  try {
    const { username, email, name, role } = req.body;
    const userId = req.user.id; // Get current user's ID from token
    
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(username && { username }),
        ...(email && { email }),
        ...(name && { name }),
        // Note: Role updates could be restricted or removed entirely
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

async function registerUser(req, res) {
  try {
    const { accessCode, username, email, password, name, role } = req.body;
    
    // Validate access code
    if (accessCode !== process.env.REGISTRATION_ACCESS_CODE) {
      return res.status(403).json({ 
        error: 'Invalid access code' 
      });
    }
    
    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username },
          { email }
        ]
      }
    });

    if (existingUser) {
      return res.status(409).json({ 
        error: 'User with this username or email already exists' 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { 
        username, 
        email, 
        password: hashedPassword, 
        name, 
        role: role || "viewer" 
      },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({ user, token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function loginUser(req, res) {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ 
        error: "username and password are required" 
      });
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { username },
          { email: username }
        ]
      }
    });

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ 
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        role: user.role
      }, 
      token 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function getCurrentUser(req, res) {
  res.json({ user: req.user });
}

module.exports = {
  getAllUsers,
  getUserById,
  updateCurrentUser,
  getUserProcesses,
  getUserCustomers,
  getUserSales,
  registerUser,
  loginUser,
  getCurrentUser,
};
