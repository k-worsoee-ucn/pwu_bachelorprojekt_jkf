const express = require("express");
const router = express.Router();
const caseController = require("../controllers/case.controller");
const { verifyToken, requireRole } = require("../middleware/auth");
const { canAccessStep } = require("../middleware/stepAuth");

router.get("/", verifyToken, caseController.getAllCases);
router.get(
  "/process/:processId",
  verifyToken,
  caseController.getCasesByProcessId
);
router.get("/:id", verifyToken, caseController.getCaseById);

// Step 6: Only marketing managers can create/update cases
router.post("/", verifyToken, canAccessStep(6), caseController.createCase);
router.put("/:id", verifyToken, canAccessStep(6), caseController.updateCase);
router.delete(
  "/:id",
  verifyToken,
  requireRole(["salesManager", "marketingManager"]),
  caseController.deleteCase
);

module.exports = router;
