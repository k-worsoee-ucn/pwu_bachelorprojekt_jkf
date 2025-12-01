const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const { verifyToken, requireRole } = require("../middleware/auth");

const requireAdmin = requireRole(['admin']);

// Public routes
router.post("/login", userController.loginUser);
// router.post("/register", userController.registerUser);

// Protected routes
router.get("/me", verifyToken, userController.getCurrentUser);
router.get("/:id", verifyToken, userController.getUserById);
router.get("/", verifyToken, userController.getAllUsers);
router.post("/", verifyToken, requireAdmin, userController.createUser);
router.put("/:id", verifyToken, userController.updateUser);
router.delete("/:id", verifyToken, requireAdmin, userController.deleteUser);

router.get("/:id/processes", verifyToken, userController.getUserProcesses);
router.get("/:id/customers", verifyToken, userController.getUserCustomers);
router.get("/:id/sales", verifyToken, userController.getUserSales);

module.exports = router;
