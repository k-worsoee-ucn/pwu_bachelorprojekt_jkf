const express = require("express");
const router = express.Router();
const salesController = require("../controllers/sales.controller");
const { verifyToken, requireRole } = require("../middleware/auth");
const { canUpdateSale } = require("../middleware/stepAuth");

router.post(
  "/",
  verifyToken,
  requireRole(["salesManager"]),
  salesController.createSale
);
router.put("/:id", verifyToken, canUpdateSale, salesController.updateSale);

module.exports = router;
