const salesService = require("../services/sales.service");

async function getAllSales(req, res) {
  try {
    const sales = await salesService.getAllSales();
    res.json(sales);
  } catch (error) {
    console.error("Error in getAllSales:", error);
    if (error.status === 404)
      return res.status(404).json({ error: error.message });
    res.status(500).json({ error: "An error occurred processing your request" });
  }
}

async function getSaleById(req, res) {
  try {
    const { id } = req.params;
    const sale = await salesService.getSaleById(id);
    res.json(sale);
  } catch (error) {
    console.error("Error in getSaleById:", error);
    if (error.status === 404)
      return res.status(404).json({ error: error.message });
    res.status(500).json({ error: "An error occurred processing your request" });
  }
}

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

async function deleteSale(req, res) {
  try {
    const { id } = req.params;
    await salesService.deleteSale(id);
    res.status(204).send();
  } catch (error) {
    console.error("Error in deleteSale:", error);
    if (error.status === 404)
      return res.status(404).json({ error: error.message });
    res.status(500).json({ error: "An error occurred processing your request" });
  }
}

module.exports = {
  getAllSales,
  getSaleById,
  createSale,
  updateSale,
  deleteSale,
};
