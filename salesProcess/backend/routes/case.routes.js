const express = require("express");
const router = express.Router();
const caseController = require("../controllers/case.controller");
const { verifyToken, canAccessStep } = require("../middleware/auth");
const { canAccessStep: canAccessStepAuth } = require("../middleware/stepAuth");

router.get(
  "/process/:processId",
  verifyToken,
  caseController.getCasesByProcessId
);

// Step 6: Only marketing managers can create/update cases
router.post("/", verifyToken, canAccessStepAuth(6), caseController.createCase);
router.put("/:id", verifyToken, canAccessStepAuth(6), caseController.updateCase);

module.exports = router;
