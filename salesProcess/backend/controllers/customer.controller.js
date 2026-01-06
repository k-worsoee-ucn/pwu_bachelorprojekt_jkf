const customerService = require("../services/customer.service");

async function getAllCustomers(req, res) {
  try {
    const customers = await customerService.getAllCustomers(req.query);
    res.json(customers);
  } catch (error) {
    console.error("Error in getAllCustomers:", error);
    if (error.status === 404)
      return res.status(404).json({ error: error.message });
    res.status(500).json({ error: "An error occurred processing your request" });
  }
}

async function getCustomerById(req, res) {
  try {
    const { id } = req.params;
    const customer = await customerService.getCustomerById(id);
    res.json(customer);
  } catch (error) {
    console.error("Error in getCustomerById:", error);
    if (error.status === 404)
      return res.status(404).json({ error: error.message });
    res.status(500).json({ error: "An error occurred processing your request" });
  }
}

async function createCustomer(req, res) {
  try {
    const customer = await customerService.createCustomer(req.body);
    res.status(201).json(customer);
  } catch (error) {
    console.error("Error in createCustomer:", error);
    if (error.status === 400)
      return res.status(400).json({ error: error.message });
    res.status(500).json({ error: "An error occurred processing your request" });
  }
}

async function updateCustomer(req, res) {
  try {
    const { id } = req.params;
    const customer = await customerService.updateCustomer(id, req.body);
    res.json(customer);
  } catch (error) {
    console.error("Error in updateCustomer:", error);
    if (error.status === 400)
      return res.status(400).json({ error: error.message });
    if (error.status === 404)
      return res.status(404).json({ error: error.message });
    res.status(500).json({ error: "An error occurred processing your request" });
  }
}

async function deleteCustomer(req, res) {
  try {
    const { id } = req.params;
    await customerService.deleteCustomer(id);
    res.status(204).send();
  } catch (error) {
    console.error("Error in deleteCustomer:", error);
    if (error.status === 404)
      return res.status(404).json({ error: error.message });
    res.status(500).json({ error: "An error occurred processing your request" });
  }
}

async function getCustomerSales(req, res) {
  try {
    const { id } = req.params;
    const sales = await customerService.getCustomerSales(id);
    res.json(sales);
  } catch (error) {
    console.error("Error in getCustomerSales:", error);
    if (error.status === 404)
      return res.status(404).json({ error: error.message });
    res.status(500).json({ error: "An error occurred processing your request" });
  }
}

module.exports = {
  getAllCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getCustomerSales,
};
