const caseService = require("../services/case.service");

async function getAllCases(req, res) {
  try {
    const { processId, referenceId } = req.query;
    const cases = await caseService.getAllCases(processId, referenceId);
    res.json(cases);
  } catch (error) {
    console.error("Error in getAllCases:", error);
    res.status(500).json({ error: "An error occurred processing your request" });
  }
}

async function getCaseById(req, res) {
  try {
    const caseItem = await caseService.getCaseById(req.params.id);
    res.json(caseItem);
  } catch (error) {
    if (error.status === 404) {
      return res.status(404).json({ error: error.message });
    }
    console.error("Error in getCaseById:", error);
    res.status(500).json({ error: "An error occurred processing your request" });
  }
}

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

async function deleteCase(req, res) {
  try {
    await caseService.deleteCase(req.params.id);
    res.status(204).send();
  } catch (error) {
    console.error("Error in deleteCase:", error);
    res.status(500).json({ error: "An error occurred processing your request" });
  }
}

module.exports = {
  getAllCases,
  getCaseById,
  getCasesByProcessId,
  createCase,
  updateCase,
  deleteCase,
};
