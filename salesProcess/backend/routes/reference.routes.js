const express = require("express");
const router = express.Router();
const referenceController = require("../controllers/reference.controller");
const { verifyToken, requireRole } = require("../middleware/auth");

router.get("/", verifyToken, referenceController.getAllReferences);
router.get("/:id", verifyToken, referenceController.getReferenceById);

router.post("/", verifyToken, requireRole(['salesManager', 'marketingManager']), referenceController.createReference);
router.put("/:id", verifyToken, requireRole(['salesManager', 'marketingManager']), referenceController.updateReference);
router.delete("/:id", verifyToken, requireRole(['salesManager', 'marketingManager']), referenceController.deleteReference);

module.exports = router;
