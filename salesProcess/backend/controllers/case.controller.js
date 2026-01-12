const caseService = require("../services/case.service");

async function getCasesByProcessId(req, res) {
  try {
    const { processId } = req.params;
    const cases = await caseService.getCasesByProcessId(processId);
    res.json(cases);
  } catch (error) {
    console.error("Error in getCasesByProcessId:", error);
    res.status(500).json({ error: "An error occurred processing your request" });
  }
}

async function createCase(req, res) {
  try {
    const caseItem = await caseService.createCase(req.body);
    res.status(201).json(caseItem);
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ error: error.message });
    }
    console.error("Error in createCase:", error);
    res.status(500).json({ error: "An error occurred processing your request" });
  }
}

async function updateCase(req, res) {
  try {
    const caseItem = await caseService.updateCase(req.params.id, req.body);
    res.json(caseItem);
  } catch (error) {
    console.error("Error in updateCase:", error);
    res.status(500).json({ error: "An error occurred processing your request" });
  }
}

module.exports = {
  getCasesByProcessId,
  createCase,
  updateCase,
};
