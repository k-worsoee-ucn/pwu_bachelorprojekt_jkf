const prisma = require("./prisma");

async function getAllProducts(req, res) {
  try {
    const { processId, referenceId, caseId } = req.query;

    const whereClause = {};
    if (processId) whereClause.processId = parseInt(processId);
    if (referenceId) whereClause.referenceId = parseInt(referenceId);
    if (caseId) whereClause.caseId = parseInt(caseId);

    const products = await prisma.product.findMany({
      where: Object.keys(whereClause).length > 0 ? whereClause : undefined,
      select: {
        id: true,
        title: true,
        category: true,
        processId: true,
        referenceId: true,
        caseId: true,
      },
      orderBy: {
        category: 'asc'
      }
    });

    res.json(products);
  } catch (error) {
    console.error('Error in getAllProducts:', error);
    res.status(500).json({ error: 'An error occurred processing your request' });
  }
}

async function getProductById(req, res) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        process: true,
        reference: true,
        case: true,
        saleProducts: {
          include: {
            sale: {
              include: {
                customer: true,
                process: true,
              },
            },
          },
        },
      },
    });

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json(product);
  } catch (error) {
    console.error('Error in getProductById:', error);
    res.status(500).json({ error: 'An error occurred processing your request' });
  }
}

async function createProduct(req, res) {
  try {
    const { title, category, processId, referenceId, caseId } = req.body;

    if (!title) {
      return res.status(400).json({ error: "title is required" });
    }
    if (!category) {
      return res.status(400).json({ error: "category is required" });
    }

    const product = await prisma.product.create({
      data: {
        title,
        category,
        ...(processId && { processId }),
        ...(referenceId && { referenceId }),
        ...(caseId && { caseId }),
      },
      select: {
        id: true,
        title: true,
        category: true,
        processId: true,
        referenceId: true,
        caseId: true,
      },
    });

    res.status(201).json(product);
  } catch (error) {
    console.error('Error in createProduct:', error);
    res.status(500).json({ error: 'An error occurred processing your request' });
  }
}

async function updateProduct(req, res) {
  try {
    const { title, processId, referenceId, caseId } = req.body;

    const product = await prisma.product.update({
      where: { id: parseInt(req.params.id) },
      data: {
        ...(title && { title }),
        ...(processId !== undefined && { processId }),
        ...(referenceId !== undefined && { referenceId }),
        ...(caseId !== undefined && { caseId }),
      },
      include: {
        process: true,
        reference: true,
        case: true,
      },
    });

    res.json(product);
  } catch (error) {
    console.error('Error in updateProduct:', error);
    res.status(500).json({ error: 'An error occurred processing your request' });
  }
}

async function deleteProduct(req, res) {
  try {
    await prisma.product.delete({ where: { id: parseInt(req.params.id) } });
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
