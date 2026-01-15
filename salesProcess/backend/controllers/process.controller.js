const processService = require("../services/process.service");

async function getAllProcesses(req, res) {
  try {
    const processes = await processService.getAllProcesses();
    res.json(processes);
  } catch (error) {
    console.error('Error in getAllProcesses:', error);
    res.status(500).json({ error: 'An error occurred processing your request' });
  }
}

async function getProcessById(req, res) {
  try {
    const process = await processService.getProcessById(req.params.id);
    res.json(process);
  } catch (error) {
    console.error('Error in getProcessById:', error);
    const statusCode = error.status || 500;
    const message = error.message || 'An error occurred processing your request';
    res.status(statusCode).json({ error: message });
  }
}

async function updateProcess(req, res) {
  try {
    const processId = parseInt(req.params.id);
    const { title, caseNo, status, consent, currentStep, shippingDate } = req.body;

    const process = await processService.updateProcess(processId, {
      title,
      caseNo,
      status,
      consent,
      currentStep,
      shippingDate
    });
    res.json(process);
  } catch (error) {
    console.error('Error in updateProcess:', error);
    res.status(500).json({ error: 'An error occurred processing your request' });
  }
}

async function getFilterOptions(req, res) {
  try {
    const filterOptions = await processService.getFilterOptions();
    res.json(filterOptions);
  } catch (error) {
    console.error('Error in getFilterOptions:', error);
    res.status(500).json({ error: 'An error occurred processing your request' });
  }
}

module.exports = {
  getAllProcesses,
  getProcessById,
  updateProcess,
  getFilterOptions,
};
