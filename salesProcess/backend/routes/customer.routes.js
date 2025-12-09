const express = require("express");
const router = express.Router();
const customerController = require("../controllers/customer.controller");
const { verifyToken, requireRole } = require("../middleware/auth");

router.get("/", verifyToken, customerController.getAllCustomers);
router.get("/:id", verifyToken, customerController.getCustomerById);
router.get("/:id/sales", verifyToken, customerController.getCustomerSales);

router.post("/", verifyToken, requireRole(['salesManager']), customerController.createCustomer);
router.put("/:id", verifyToken, requireRole(['salesManager']), customerController.updateCustomer);
router.delete("/:id", verifyToken, requireRole(['salesManager']), customerController.deleteCustomer);

module.exports = router;
