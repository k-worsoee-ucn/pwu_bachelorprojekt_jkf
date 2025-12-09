const express = require("express");
const router = express.Router();
const caseController = require("../controllers/case.controller");
const { verifyToken, requireRole } = require("../middleware/auth");

router.get("/", verifyToken, caseController.getAllCases);
router.get("/:id", verifyToken, caseController.getCaseById);

router.post("/", verifyToken, requireRole(['salesManager', 'marketingManager']), caseController.createCase);
router.put("/:id", verifyToken, requireRole(['salesManager', 'marketingManager']), caseController.updateCase);
router.delete("/:id", verifyToken, requireRole(['salesManager', 'marketingManager']), caseController.deleteCase);

module.exports = router;
