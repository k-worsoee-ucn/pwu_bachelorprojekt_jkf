const productService = require("../services/product.service");

async function getAllProducts(req, res) {
  try {
    const products = await productService.getAllProducts();
    res.json(products);
  } catch (error) {
    console.error('Error in getAllProducts:', error);
    res.status(500).json({ error: 'An error occurred processing your request' });
  }
}

module.exports = {
  getAllProducts,
};
