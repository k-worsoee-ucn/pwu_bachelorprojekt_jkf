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

module.exports = {
  getAllProducts,
};
