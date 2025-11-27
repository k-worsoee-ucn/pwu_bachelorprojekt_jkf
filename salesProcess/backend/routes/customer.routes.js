const express = require("express");
const router = express.Router();
const customerController = require("../controllers/customer.controller");

router.get("/", customerController.getAllCustomers);
router.get("/:id", customerController.getCustomerById);
router.post("/", customerController.createCustomer);
router.put("/:id", customerController.updateCustomer);
router.delete("/:id", customerController.deleteCustomer);
router.get("/:id/sales", customerController.getCustomerSales);

module.exports = router;
