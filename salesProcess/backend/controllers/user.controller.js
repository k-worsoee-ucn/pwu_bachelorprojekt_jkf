const prisma = require("./prisma");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const encryption = require("../utils/encryption");

async function getAllUsers(req, res) {
  try {
    const { role } = req.query;
    const whereClause = {};
    if (role) whereClause.role = role;

    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Decrypt names
    const decryptedUsers = users.map(user => ({
      ...user,
      name: user.name ? encryption.decrypt(user.name) : null
    }));

    res.json(decryptedUsers);
  } catch (error) {
    console.error('Error in getAllUsers:', error);
    res.status(500).json({ error: 'An error occurred processing your request' });
  }
}

async function getUserById(req, res) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(req.params.id) },
      select: {
        id: true,
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
    
    // Decrypt name
    if (user.name) {
      user.name = encryption.decrypt(user.name);
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error in getUserById:', error);
    res.status(500).json({ error: 'An error occurred processing your request' });
  }
}

async function updateCurrentUser(req, res) {
  try {
    const { email, name, role, password, accessCode } = req.body;
    const userId = req.user.id;

    let updateData = {};
    if (email) updateData.email = email;
    if (name) updateData.name = encryption.encrypt(name);
    if (role) updateData.role = role;

    if (password) {
      if (!accessCode || accessCode !== process.env.REGISTRATION_ACCESS_CODE) {
        console.log('Access code missing or invalid for password update');
        return res.status(403).json({ error: 'Valid access code required to change password' });
      }

      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[a-zA-Z\d@$!%*?&]{8,}$/;
      if (!passwordRegex.test(password)) {
        return res.status(400).json({ 
          error: 'Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character (@$!%*?&)' 
        });
      }

      const bcrypt = require('bcrypt');
      updateData.password = await bcrypt.hash(password, 10);
      console.log('Password will be updated for user:', userId);
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        updatedAt: true,
      },
    });

    // Decrypt name before returning
    if (user.name) {
      user.name = encryption.decrypt(user.name);
    }

    res.json(user);
  } catch (error) {
    console.error('Error in updateCurrentUser:', error);
    res.status(500).json({ error: 'An error occurred processing your request' });
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
    console.error('Error in getUserProcesses:', error);
    res.status(500).json({ error: 'An error occurred processing your request' });
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
    console.error('Error in getUserCustomers:', error);
    res.status(500).json({ error: 'An error occurred processing your request' });
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
    console.error('Error in getUserSales:', error);
    res.status(500).json({ error: 'An error occurred processing your request' });
  }
}

async function registerUser(req, res) {
  try {
    const { accessCode, email, password, name, role } = req.body;
    
    // Validate access code
    if (accessCode !== process.env.REGISTRATION_ACCESS_CODE) {
      return res.status(403).json({ 
        error: 'Invalid access code' 
      });
    }
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(409).json({ 
        error: 'User with this email already exists' 
      });
    }

    // Validate password complexity
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[a-zA-Z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({ 
        error: 'Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character (@$!%*?&)' 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    const encryptedName = encryption.encrypt(name);

    const user = await prisma.user.create({
      data: { 
        email, 
        password: hashedPassword, 
        name: encryptedName, 
        role: role || "viewer" 
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Decrypt name for response
    const responseUser = { ...user };
    if (responseUser.name) {
      responseUser.name = encryption.decrypt(responseUser.name);
    }

    // Set token in httpOnly cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    res.status(201).json({ user: responseUser });
  } catch (error) {
    console.error('Error in registerUser:', error);
    res.status(500).json({ error: 'An error occurred processing your request' });
  }
}

async function loginUser(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ 
        error: "email and password are required" 
      });
    }

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Set token in httpOnly cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    res.json({ 
      user: {
        id: user.id,
        email: user.email,
        name: user.name ? encryption.decrypt(user.name) : null,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error in loginUser:', error);
    res.status(500).json({ error: 'An error occurred processing your request' });
  }
}

async function getCurrentUser(req, res) {
  const user = req.user;
  if (user && user.name) {
    user.name = encryption.decrypt(user.name);
  }
  res.json({ user });
}

async function logoutUser(req, res) {
  try {
    // Clear the token cookie
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });
    
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Error in logoutUser:', error);
    res.status(500).json({ error: 'An error occurred processing your request' });
  }
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
  logoutUser,
};
