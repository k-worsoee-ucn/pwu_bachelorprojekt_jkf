const express = require("express");
const router = express.Router();
const processController = require("../controllers/process.controller");

router.get("/", processController.getAllProcesses);
router.get("/:id", processController.getProcessById);
router.post("/", processController.createProcess);
router.put("/:id", processController.updateProcess);
router.delete("/:id", processController.deleteProcess);

module.exports = router;
