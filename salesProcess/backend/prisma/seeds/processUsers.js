const { PrismaClient } = require('@prisma/client');

async function seedProcessUsers(prisma) {
  console.log('Seeding process users...');

  const processes = await prisma.process.findMany({
    include: {
      sale: {
        select: { salesManagerId: true }
      }
    }
  });
  
  const marketingManagers = await prisma.user.findMany({
    where: { role: 'marketingManager' },
    select: { id: true }
  });

  const processUserData = [];

  for (const process of processes) {
 
    if (process.sale?.salesManagerId) {
      processUserData.push({
        processId: process.id,
        userId: process.sale.salesManagerId,
        role: 'salesManager'
      });
    }

    for (const marketingManager of marketingManagers) {
      processUserData.push({
        processId: process.id,
        userId: marketingManager.id,
        role: 'marketingManager'
      });
    }
  }

  for (const processUserEntry of processUserData) {
    await prisma.processUser.upsert({
      where: {
        processId_userId_role: {
          processId: processUserEntry.processId,
          userId: processUserEntry.userId,
          role: processUserEntry.role
        }
      },
      update: {},
      create: processUserEntry
    });
  }
  
  console.log(`Seeded ${processUserData.length} process user assignments`);
  console.log(`- Sales managers assigned to their processes`);
  console.log(`- All marketing managers assigned to all ${processes.length} processes`);
}

module.exports = { seedProcessUsers };