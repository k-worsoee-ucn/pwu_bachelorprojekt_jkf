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

// Registration-specific rate limiting (more restrictive)
const registrationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // Only 3 registration attempts per IP per window
  message: { error: 'Too many registration attempts. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Public routes
router.post("/login", validateUserLogin, userController.loginUser);
router.post("/register", registrationLimiter, validateUserRegistration, userController.registerUser);

// Protected routes
router.get("/me", verifyToken, userController.getCurrentUser);
router.get("/:id", verifyToken, validateId, userController.getUserById);
router.get("/", verifyToken, userController.getAllUsers);
router.put("/me", verifyToken, userController.updateCurrentUser);

router.get("/:id/processes", verifyToken, validateId, userController.getUserProcesses);
router.get("/:id/customers", verifyToken, validateId, userController.getUserCustomers);
router.get("/:id/sales", verifyToken, validateId, userController.getUserSales);

module.exports = router;
