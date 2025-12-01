const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
require('dotenv').config();

const prisma = new PrismaClient();

async function main() {

  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminUsername = process.env.ADMIN_USERNAME || 'admin';
  const adminName = process.env.ADMIN_NAME || 'System Administrator';

  const existingAdmin = await prisma.user.findFirst({
    where: { role: 'admin' }
  });

  if (existingAdmin) {
    return;
  }

  // Create initial admin user
  const hashedPassword = await bcrypt.hash(adminPassword, 10);
  
  const admin = await prisma.user.create({
    data: {
      username: adminUsername,
      email: `${adminUsername}@system.local`,
      password: hashedPassword,
      name: adminName,
      role: 'admin'
    },
    select: {
      id: true,
      username: true,
      email: true,
      name: true,
      role: true,
      createdAt: true
    }
  });

  console.log('Created admin user:', admin);

  // More sample data
  
  console.log('Seed completed!');
}

main()
  .catch((e) => {
    console.error('Seed failed:');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });