const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function seedProducts(/* FKs */) {
  const products = await Promise.all([
    prisma.product.upsert({
      where: { id: 1 },
      update: {},
      create: {
        title: "SBF220S 4,0 Super Blower Filter",
        category: "filtersAndSeparators",
      },
    }),
    prisma.product.upsert({
      where: { id: 2 },
      update: {},
      create: {
        title: "6 Blower- and Jetfilter",
        category: "filtersAndSeparators",
      },
    }),
    prisma.product.upsert({
      where: { id: 3 },
      update: {},
      create: {
        title: "DS-12 EC-S",
        category: "filtersAndSeparators",
      },
    }),
    prisma.product.upsert({
      where: { id: 4 },
      update: {},
      create: {
        title: "JK MTD 40",
        category: "fanSystems",
      },
    }),
    prisma.product.upsert({
      where: { id: 5 },
      update: {},
      create: {
        title: "JKF fan",
        category: "fanSystems",
      },
    }),
    prisma.product.upsert({
      where: { id: 6 },
      update: {},
      create: {
        title:
          "JK-100MT clean air fan x 1 unit - JK-30D transport fan x 1 unit",
        category: "fanSystems",
      },
    }),
    prisma.product.upsert({
      where: { id: 7 },
      update: {},
      create: {
        title: "JK-60 MTD",
        category: "fanSystems",
      },
    }),
    prisma.product.upsert({
      where: { id: 8 },
      update: {},
      create: {
        title: "JKF standard - galvanised",
        category: "ductSystems",
      },
    }),
    prisma.product.upsert({
      where: { id: 9 },
      update: {},
      create: {
        title: "JKF standard",
        category: "ductSystems",
      },
    }),
  ]);

  console.log(`Created ${products.length} products`);
  return products;
}

module.exports = { seedProducts };
