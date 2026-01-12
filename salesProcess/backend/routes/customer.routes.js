const express = require("express");
const router = express.Router();
const customerController = require("../controllers/customer.controller");
const { verifyToken } = require("../middleware/auth");

router.get("/", verifyToken, customerController.getAllCustomers);

module.exports = router;
