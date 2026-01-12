const prisma = require("../utils/prisma");
const jwt = require('jsonwebtoken');
const encryption = require("../utils/encryption");
const { validatePasswordComplexity, getPasswordValidationError, hashPassword, verifyPassword } = require("../utils/password");

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

async function registerUser(registrationData) {
  const { accessCode, email, password, name, role } = registrationData;
  
  // Validate access code
  if (accessCode !== process.env.REGISTRATION_ACCESS_CODE) {
    throw { status: 403, message: 'Invalid access code' };
  }

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
  updateCurrentUser,
  registerUser,
  generateToken,
  loginUser,
  getCurrentUser,
};
