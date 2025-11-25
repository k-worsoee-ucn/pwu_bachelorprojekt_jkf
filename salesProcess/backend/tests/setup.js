require('dotenv').config({ path: '.env.test' });
const { PrismaClient } = require('@prisma/client');

// Global test variables
global.prisma = new PrismaClient();

beforeAll(async () => {
  await global.prisma.$connect();
});

afterAll(async () => {
  await global.prisma.$disconnect();
});

jest.setTimeout(10000);