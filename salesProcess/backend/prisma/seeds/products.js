const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function seedProducts(/* FKs */) {
  
  const products = await Promise.all([
    prisma.product.upsert({
      where: { id: 1 },
      update: {},
      create: {
        title: 'Product 1',
        category: 'filtersAndSeparators',
      }
    }),
    prisma.product.upsert({
      where: { id: 2 },
      update: {},
      create: {
        title: 'Product 2',
        category: 'filtersAndSeparators',
      }
    }),
    prisma.product.upsert({
      where: { id: 3 },
      update: {},
      create: {
        title: 'Product 3',
        category: 'filtersAndSeparators',
      }
    }),
    prisma.product.upsert({
      where: { id: 4 },
      update: {},
      create: {
        title: 'Product 4',
        category: 'fanSystems',
      }
    }),
    prisma.product.upsert({
      where: { id: 5 },
      update: {},
      create: {
        title: 'Product 5',
        category: 'fanSystems',
      }
    }),
    prisma.product.upsert({
      where: { id: 6 },
      update: {},
      create: {
        title: 'Product 6',
        category: 'fanSystems',
      }
    }),
    prisma.product.upsert({
      where: { id: 7 },
      update: {},
      create: {
        title: 'Product 7',
        category: 'fanSystems',
      }
    }),
    prisma.product.upsert({
      where: { id: 8 },
      update: {},
      create: {
        title: 'Product 8',
        category: 'ductSystems',
      }
    }),
    prisma.product.upsert({
      where: { id: 9 },
      update: {},
      create: {
        title: 'Product 9',
        category: 'ductSystems',
      }
    }),
    prisma.product.upsert({
      where: { id: 10 },
      update: {},
      create: {
        title: 'Product 10',
        category: 'ductSystems',
      }
    }),
  ])

  console.log(`Created ${products.length} products`)
  return products
}

module.exports = { seedProducts }