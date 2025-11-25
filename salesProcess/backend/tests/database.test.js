const { PrismaClient } = require('@prisma/client');

describe('Database Connection', () => {
  let prisma;

  beforeAll(() => {
    prisma = global.prisma;
  });

  describe('Basic Connection', () => {
    // Connection tests
    test('should connect to database successfully', async () => {
      await expect(prisma.$connect()).resolves.not.toThrow();
    });

    // Disconnect test
    test('should be able to disconnect from database', async () => {
      const testPrisma = new PrismaClient();
      await testPrisma.$connect();
      await expect(testPrisma.$disconnect()).resolves.not.toThrow();
    });
  });

  describe('Migration', () => {

    // Migration test
    test('should have all expected tables from migration', async () => {
      await expect(prisma.process.findMany()).resolves.toBeDefined();
      await expect(prisma.sale.findMany()).resolves.toBeDefined();
      await expect(prisma.user.findMany()).resolves.toBeDefined();
      await expect(prisma.customer.findMany()).resolves.toBeDefined();
    });
  });
});