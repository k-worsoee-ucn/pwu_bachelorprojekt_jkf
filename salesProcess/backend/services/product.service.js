const prisma = require("../utils/prisma");

async function getAllProducts() {
  const products = await prisma.product.findMany({
    select: {
      id: true,
      title: true,
      category: true,
    },
    orderBy: {
      category: 'asc'
    }
  });

  return products;
}

async function getProductById(productId) {
  const product = await prisma.product.findUnique({
    where: { id: parseInt(productId) },
    include: {
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
    throw { status: 404, message: "Product not found" };
  }

  return product;
}

async function createProduct(productData) {
  const { title, category } = productData;

  // Validation
  if (!title) {
    throw { status: 400, message: "title is required" };
  }
  if (!category) {
    throw { status: 400, message: "category is required" };
  }

  const product = await prisma.product.create({
    data: {
      title,
      category,
    },
    select: {
      id: true,
      title: true,
      category: true,
    },
  });

  return product;
}

async function updateProduct(productId, updateFields) {
  const { title, category } = updateFields;

  const product = await prisma.product.update({
    where: { id: parseInt(productId) },
    data: {
      ...(title && { title }),
      ...(category && { category }),
    },
    include: {
      saleProducts: true,
    },
  });

  return product;
}

async function deleteProduct(productId) {
  const existingProduct = await prisma.product.findUnique({
    where: { id: parseInt(productId) },
  });

  if (!existingProduct) {
    throw { status: 404, message: "Product not found" };
  }

  await prisma.product.delete({
    where: { id: parseInt(productId) },
  });

  return { message: "Product deleted successfully" };
}

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
