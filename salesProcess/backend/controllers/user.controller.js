const userService = require("../services/user.service");

async function getAllUsers(req, res) {
  try {
    const { role } = req.query;
    const users = await userService.getAllUsers(role);
    res.json(users);
  } catch (error) {
    console.error('Error in getAllUsers:', error);
    const statusCode = error.status || 500;
    const message = error.message || 'An error occurred processing your request';
    res.status(statusCode).json({ error: message });
  }
}

async function getUserById(req, res) {
  try {
    const user = await userService.getUserById(req.params.id);
    res.json(user);
  } catch (error) {
    console.error('Error in getUserById:', error);
    const statusCode = error.status || 500;
    const message = error.message || 'An error occurred processing your request';
    res.status(statusCode).json({ error: message });
  }
}

async function updateCurrentUser(req, res) {
  try {
    const user = await userService.updateCurrentUser(req.user.id, req.body);
    res.json(user);
  } catch (error) {
    console.error('Error in updateCurrentUser:', error);
    const statusCode = error.status || 500;
    const message = error.message || 'An error occurred processing your request';
    res.status(statusCode).json({ error: message });
  }
}

async function getUserProcesses(req, res) {
  try {
    const processUsers = await userService.getUserProcesses(req.params.id);
    res.json(processUsers);
  } catch (error) {
    console.error('Error in getUserProcesses:', error);
    const statusCode = error.status || 500;
    const message = error.message || 'An error occurred processing your request';
    res.status(statusCode).json({ error: message });
  }
}

async function getUserCustomers(req, res) {
  try {
    const customers = await userService.getUserCustomers(req.params.id);
    res.json(customers);
  } catch (error) {
    console.error('Error in getUserCustomers:', error);
    const statusCode = error.status || 500;
    const message = error.message || 'An error occurred processing your request';
    res.status(statusCode).json({ error: message });
  }
}

async function getUserSales(req, res) {
  try {
    const sales = await userService.getUserSales(req.params.id);
    res.json(sales);
  } catch (error) {
    console.error('Error in getUserSales:', error);
    const statusCode = error.status || 500;
    const message = error.message || 'An error occurred processing your request';
    res.status(statusCode).json({ error: message });
  }
}

async function registerUser(req, res) {
  try {
    const user = await userService.registerUser(req.body);

    // Generate JWT token
    const token = await userService.generateToken(user);

    // Set token in httpOnly cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    res.status(201).json({ user });
  } catch (error) {
    console.error('Error in registerUser:', error);
    const statusCode = error.status || 500;
    const message = error.message || 'An error occurred processing your request';
    res.status(statusCode).json({ error: message });
  }
}

async function loginUser(req, res) {
  try {
    const user = await userService.loginUser(req.body);

    const token = await userService.generateToken(user);

    // Set token in httpOnly cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    res.json({ user });
  } catch (error) {
    console.error('Error in loginUser:', error);
    const statusCode = error.status || 500;
    const message = error.message || 'An error occurred processing your request';
    res.status(statusCode).json({ error: message });
  }
}

async function getCurrentUser(req, res) {
  try {
    const user = await userService.getCurrentUser(req.user);
    res.json({ user });
  } catch (error) {
    console.error('Error in getCurrentUser:', error);
    const statusCode = error.status || 500;
    const message = error.message || 'An error occurred processing your request';
    res.status(statusCode).json({ error: message });
  }
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
