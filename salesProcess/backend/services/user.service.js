const prisma = require("../controllers/prisma");
const jwt = require('jsonwebtoken');
const encryption = require("../utils/encryption");
const { validatePasswordComplexity, getPasswordValidationError, hashPassword, verifyPassword } = require("../utils/password");

async function getAllUsers(role = null) {
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

  return decryptedUsers;
}

async function getUserById(userId) {
  const user = await prisma.user.findUnique({
    where: { id: parseInt(userId) },
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

  if (!user) {
    throw { status: 404, message: "User not found" };
  }
  
  // Decrypt name
  if (user.name) {
    user.name = encryption.decrypt(user.name);
  }
  
  return user;
}

async function updateCurrentUser(userId, updateFields) {
  const { email, name, role, password, accessCode } = updateFields;

  let updateData = {};
  if (email) updateData.email = email;
  if (name) updateData.name = encryption.encrypt(name);
  if (role) updateData.role = role;

  if (password) {
    if (!accessCode || accessCode !== process.env.REGISTRATION_ACCESS_CODE) {
      throw { status: 403, message: 'Valid access code required to change password' };
    }

    if (!validatePasswordComplexity(password)) {
      throw { status: 400, message: getPasswordValidationError() };
    }

    updateData.password = await hashPassword(password);
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

  return user;
}

async function getUserProcesses(userId) {
  const processUsers = await prisma.processUser.findMany({
    where: { userId: parseInt(userId), isActive: true },
    include: { process: { include: { sale: true } } },
  });

  return processUsers;
}

async function getUserCustomers(userId) {
  const customers = await prisma.customer.findMany({
    where: { salesManagerId: parseInt(userId) },
    include: { sales: true },
  });

  return customers;
}

async function getUserSales(userId) {
  const sales = await prisma.sale.findMany({
    where: { salesManagerId: parseInt(userId) },
    include: {
      customer: true,
      process: true,
      saleProducts: { include: { product: true } },
    },
  });

  return sales;
}

async function registerUser(registrationData) {
  const { accessCode, email, password, name, role } = registrationData;
  
  // Validate access code
  if (accessCode !== process.env.REGISTRATION_ACCESS_CODE) {
    throw { status: 403, message: 'Invalid access code' };
  }
  
  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    throw { status: 409, message: 'User with this email already exists' };
  }

  // Validate password complexity
  if (!validatePasswordComplexity(password)) {
    throw { status: 400, message: getPasswordValidationError() };
  }

  // Hash password
  const hashedPassword = await hashPassword(password);
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

  // Decrypt name for response
  if (user.name) {
    user.name = encryption.decrypt(user.name);
  }

  return user;
}

async function generateToken(user) {
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );

  return token;
}

async function loginUser(credentials) {
  const { email, password } = credentials;
  
  if (!email || !password) {
    throw { status: 400, message: "email and password are required" };
  }

  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    throw { status: 401, message: "Invalid credentials" };
  }

  const validPassword = await verifyPassword(password, user.password);
  if (!validPassword) {
    throw { status: 401, message: "Invalid credentials" };
  }

  const responseUser = {
    id: user.id,
    email: user.email,
    name: user.name ? encryption.decrypt(user.name) : null,
    role: user.role
  };

  return responseUser;
}

async function getCurrentUser(user) {
  if (user && user.name) {
    user.name = encryption.decrypt(user.name);
  }
  return user;
}

module.exports = {
  getAllUsers,
  getUserById,
  updateCurrentUser,
  getUserProcesses,
  getUserCustomers,
  getUserSales,
  registerUser,
  generateToken,
  loginUser,
  getCurrentUser,
};
