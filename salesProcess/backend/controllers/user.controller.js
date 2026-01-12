const userService = require("../services/user.service");

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
  updateCurrentUser,
  registerUser,
  loginUser,
  getCurrentUser,
  logoutUser,
};
