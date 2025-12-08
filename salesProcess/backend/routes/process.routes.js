const express = require("express");
const router = express.Router();
const processController = require("../controllers/process.controller");
const { verifyToken, requireRole } = require("../middleware/auth");

router.get("/", verifyToken, processController.getAllProcesses);
router.get("/:id", verifyToken, processController.getProcessById);

router.put("/:id", verifyToken, requireRole(['salesManager', 'marketingManager']), processController.updateProcess);
router.delete("/:id", verifyToken, requireRole(['salesManager', 'marketingManager']), processController.deleteProcess);

module.exports = router;
