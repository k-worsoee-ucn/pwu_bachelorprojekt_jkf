const express = require("express");
const router = express.Router();
const referenceController = require("../controllers/reference.controller");
const { verifyToken, requireRole } = require("../middleware/auth");
const { canAccessStep } = require("../middleware/stepAuth");

router.get("/", verifyToken, referenceController.getAllReferences);
router.get("/:id", verifyToken, referenceController.getReferenceById);

// Step 5: Only marketing managers can create/update references
router.post(
  "/",
  verifyToken,
  canAccessStep(5),
  referenceController.createReference
);
router.put(
  "/:id",
  verifyToken,
  canAccessStep(5),
  referenceController.updateReference
);
router.delete(
  "/:id",
  verifyToken,
  requireRole(["salesManager", "marketingManager"]),
  referenceController.deleteReference
);

module.exports = router;
