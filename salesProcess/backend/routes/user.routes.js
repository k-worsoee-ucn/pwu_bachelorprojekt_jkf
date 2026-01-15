const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const { verifyToken } = require("../middleware/auth");
const rateLimit = require('express-rate-limit');
const {
  validateUserLogin,
  validateUserRegistration,
  validateId
} = require("../middleware/validation");

const registrationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  message: { error: 'Too many registration attempts. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Public routes
router.post("/login", validateUserLogin, userController.loginUser);
router.post("/register", registrationLimiter, validateUserRegistration, userController.registerUser);

// Protected routes
router.get("/me", verifyToken, userController.getCurrentUser);
router.post("/logout", verifyToken, userController.logoutUser);
router.put("/me", verifyToken, userController.updateCurrentUser);

module.exports = router;
