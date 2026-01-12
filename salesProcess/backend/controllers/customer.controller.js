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

module.exports = {
  getAllCustomers,
};
