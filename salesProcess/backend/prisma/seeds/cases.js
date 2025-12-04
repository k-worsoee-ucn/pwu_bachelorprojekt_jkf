const { PrismaClient } = require('@prisma/client');

const casesData = [
  {
    id: 1,
    content: "Initial consultation meeting scheduled with client to discuss dust collection requirements for cabinet manufacturing facility. Key concerns: fine particle control, noise reduction, and energy efficiency.",
    processId: 1,
    referenceId: 1
  },
  {
    id: 2,
    content: "Site survey completed. Measured facility dimensions: 15,000 sq ft production area. Identified 12 woodworking stations requiring individual collection points. Recommended centralized system with branch ducting.",
    processId: 1,
    referenceId: 1
  },
  {
    id: 3,
    content: "Customer approved proposal for high-volume extraction system. Installation planned for next month during scheduled downtime. System specs: 50,000 CFM capacity, HEPA filtration, automated cleaning cycles.",
    processId: 2,
    referenceId: 2
  },
  {
    id: 4,
    content: "Engineering review completed for cyclone separator design. Custom specifications include 99.5% particle separation efficiency for particles >10 microns. Material: stainless steel construction for longevity.",
    processId: 3,
    referenceId: 3
  },
  {
    id: 5,
    content: "Multi-stage filtration system design finalized. Stage 1: Cyclone pre-separation, Stage 2: Bag filters, Stage 3: HEPA final filtration. Expected particulate reduction: >99.97% efficiency.",
    processId: 4,
    referenceId: 4
  },
  {
    id: 6,
    content: "Pneumatic conveying system specifications under review. Transport capacity: 10 tons/hour wood chips. Pipeline routing optimized to minimize pressure drops and material degradation.",
    processId: 5,
    referenceId: null
  },
  {
    id: 7,
    content: "Follow-up maintenance scheduled for existing installations. Quarterly filter replacements and annual system performance audits recommended to maintain optimal efficiency.",
    processId: null,
    referenceId: 5
  }
];

async function seedCases(prisma) {
  console.log('Seeding cases...');

  const processes = await prisma.process.findMany({
    orderBy: { caseNo: 'asc' },
    select: { id: true }
  });
  
  const references = await prisma.reference.findMany({
    orderBy: { id: 'asc' },
    select: { id: true }
  });

  const casesData = [
    {
      id: 1,
      content: "Initial consultation meeting scheduled with client to discuss dust collection requirements for cabinet manufacturing facility. Key concerns: fine particle control, noise reduction, and energy efficiency.",
      processId: processes[0]?.id || null,
      referenceId: references[0]?.id || null
    },
    {
      id: 2,
      content: "Site survey completed. Measured facility dimensions: 15,000 sq ft production area. Identified 12 woodworking stations requiring individual collection points. Recommended centralized system with branch ducting.",
      processId: processes[0]?.id || null,
      referenceId: references[0]?.id || null
    },
    {
      id: 3,
      content: "Customer approved proposal for high-volume extraction system. Installation planned for next month during scheduled downtime. System specs: 50,000 CFM capacity, HEPA filtration, automated cleaning cycles.",
      processId: processes[1]?.id || null,
      referenceId: references[1]?.id || null
    },
    {
      id: 4,
      content: "Engineering review completed for cyclone separator design. Custom specifications include 99.5% particle separation efficiency for particles >10 microns. Material: stainless steel construction for longevity.",
      processId: processes[2]?.id || null,
      referenceId: references[2]?.id || null
    },
    {
      id: 5,
      content: "Multi-stage filtration system design finalized. Stage 1: Cyclone pre-separation, Stage 2: Bag filters, Stage 3: HEPA final filtration. Expected particulate reduction: >99.97% efficiency.",
      processId: processes[3]?.id || null,
      referenceId: references[3]?.id || null
    },
    {
      id: 6,
      content: "Pneumatic conveying system specifications under review. Transport capacity: 10 tons/hour wood chips. Pipeline routing optimized to minimize pressure drops and material degradation.",
      processId: processes[4]?.id || null,
      referenceId: null
    },
    {
      id: 7,
      content: "Follow-up maintenance scheduled for existing installations. Quarterly filter replacements and annual system performance audits recommended to maintain optimal efficiency.",
      processId: processes[4]?.id || null,
      referenceId: null
    }
  ];
  
  for (const caseData of casesData) {
    await prisma.case.upsert({
      where: { id: caseData.id },
      update: {},
      create: caseData
    });
  }
  
  console.log(`Seeded ${casesData.length} cases`);
}

module.exports = { seedCases };