const { PrismaClient } = require('@prisma/client');

async function seedReferences(prisma) {
  console.log('Seeding references...');
  

  const processes = await prisma.process.findMany({
    orderBy: { caseNo: 'asc' },
    select: { id: true }
  });

  const referencesData = [
    {
      id: 1,
      processId: processes[0]?.id || null
    },
    {
      id: 2,
      processId: processes[1]?.id || null
    },
    {
      id: 3,
      processId: processes[2]?.id || null
    },
    {
      id: 4,
      processId: processes[3]?.id || null
    }
  ];
  
  for (const referenceData of referencesData) {
    await prisma.reference.upsert({
      where: { id: referenceData.id },
      update: {},
      create: referenceData
    });
  }
  
  console.log(`Seeded ${referencesData.length} references`);
}

module.exports = { seedReferences };