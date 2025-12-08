const express = require("express");
const router = express.Router();
const productController = require("../controllers/product.controller");
const { verifyToken, requireRole } = require("../middleware/auth");

router.get("/", verifyToken, productController.getAllProducts);
router.get("/:id", verifyToken, productController.getProductById);

router.post("/", verifyToken, requireRole(['salesManager']), productController.createProduct);
router.put("/:id", verifyToken, requireRole(['salesManager']), productController.updateProduct);
router.delete("/:id", verifyToken, requireRole(['salesManager']), productController.deleteProduct);

module.exports = router;
