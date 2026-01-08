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

async function getProductById(req, res) {
  try {
    const product = await productService.getProductById(req.params.id);
    res.json(product);
  } catch (error) {
    console.error('Error in getProductById:', error);
    const statusCode = error.status || 500;
    const message = error.message || 'An error occurred processing your request';
    res.status(statusCode).json({ error: message });
  }
}

async function createProduct(req, res) {
  try {
    const { title, category } = req.body;

    const product = await productService.createProduct({
      title,
      category
    });

    res.status(201).json(product);
  } catch (error) {
    console.error('Error in createProduct:', error);
    const statusCode = error.status || 500;
    const message = error.message || 'An error occurred processing your request';
    res.status(statusCode).json({ error: message });
  }
}

async function updateProduct(req, res) {
  try {
    const { title, category } = req.body;

    const product = await productService.updateProduct(req.params.id, {
      title,
      category
    });

    res.json(product);
  } catch (error) {
    console.error('Error in updateProduct:', error);
    res.status(500).json({ error: 'An error occurred processing your request' });
  }
}

async function deleteProduct(req, res) {
  try {
    await productService.deleteProduct(req.params.id);
    res.status(204).send();
  } catch (error) {
    console.error('Error in deleteProduct:', error);
    res.status(500).json({ error: 'An error occurred processing your request' });
  }
}

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
