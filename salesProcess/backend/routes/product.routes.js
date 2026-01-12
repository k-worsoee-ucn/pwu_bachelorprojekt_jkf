const express = require("express");
const router = express.Router();
const productController = require("../controllers/product.controller");
const { verifyToken } = require("../middleware/auth");

router.get("/", verifyToken, productController.getAllProducts);

module.exports = router;
