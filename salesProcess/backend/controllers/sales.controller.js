const salesService = require("../services/sales.service");

async function createSale(req, res) {
  try {
    const result = await salesService.createSale(req.body);
    res.status(201).json(result);
  } catch (error) {
    console.error("Error in createSale:", error);
    if (error.status === 400)
      return res.status(400).json({ error: error.message });
    if (error.status === 404)
      return res.status(404).json({ error: error.message });
    res.status(500).json({ error: "An error occurred processing your request" });
  }
}

async function updateSale(req, res) {
  try {
    const { id } = req.params;
    const sale = await salesService.updateSale(id, req.body);
    res.json(sale);
  } catch (error) {
    console.error("Error in updateSale:", error);
    if (error.status === 404)
      return res.status(404).json({ error: error.message });
    res.status(500).json({ error: "An error occurred processing your request" });
  }
}

module.exports = {
  createSale,
  updateSale,
};
