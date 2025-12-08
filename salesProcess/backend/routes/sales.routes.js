const express = require("express");
const router = express.Router();
const salesController = require("../controllers/sales.controller");
const { verifyToken, requireRole } = require("../middleware/auth");

router.get("/", verifyToken, requireRole(['salesManager', 'marketingManager']), salesController.getAllSales);
router.get("/:id", verifyToken, requireRole(['salesManager', 'marketingManager']), salesController.getSaleById);

router.post("/", verifyToken, requireRole(['salesManager']), salesController.createSale);
router.put("/:id", verifyToken, requireRole(['salesManager']), salesController.updateSale);
router.delete("/:id", verifyToken, requireRole(['salesManager']), salesController.deleteSale);

module.exports = router;
