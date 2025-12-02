const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const { verifyToken } = require("../middleware/auth");
const {
  validateUserLogin,
  validateUserCreation,
  validateId
} = require("../middleware/validation");

// Public routes
router.post("/login", validateUserLogin, userController.loginUser);

// Protected routes
router.get("/me", verifyToken, userController.getCurrentUser);
router.get("/:id", verifyToken, validateId, userController.getUserById);
router.get("/", verifyToken, userController.getAllUsers);
router.post("/", verifyToken, validateUserCreation, userController.createUser);
router.put("/:id", verifyToken, validateId, userController.updateUser);
router.delete("/:id", verifyToken, validateId, userController.deleteUser);

router.get("/:id/processes", verifyToken, validateId, userController.getUserProcesses);
router.get("/:id/customers", verifyToken, validateId, userController.getUserCustomers);
router.get("/:id/sales", verifyToken, validateId, userController.getUserSales);

module.exports = router;
