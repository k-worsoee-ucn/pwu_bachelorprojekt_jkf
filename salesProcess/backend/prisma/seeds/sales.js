const { PrismaClient } = require('@prisma/client');

const salesData = [
  {
    title: "Advanced Dust Collection System - Cabinet Manufacturing",
    endUser: "Premier Cabinet Works",
    country: "Germany",
    industry: "woodworking",
    customIndustry: null,
    plantType: "Cabinet Manufacturing",
    filterType: "Bag Filter",
    fanType: "Centrifugal",
    dustType: "Fine Wood Particles",
    ductSystem: "Centralized Branch Network",
    totalExtractionVolume: 15000,
    volumeFlow: 25000,
    customerId: 1,
    salesManagerId: 1,
    selectedFilters: [1, 2],
    selectedFans: [4, 5],
    selectedDucts: [7]
  },
  {
    title: "High-Volume Wood Chip Extraction - Furniture Factory",
    endUser: "Scandinavian Furniture Co",
    country: "Sweden",
    industry: "woodworking",
    customIndustry: null,
    plantType: "Furniture Manufacturing",
    filterType: "Cyclone Separator",
    fanType: "Axial",
    dustType: "Wood Chips and Shavings",
    ductSystem: "Main Trunk with Branches",
    totalExtractionVolume: 50000,
    volumeFlow: 75000,
    customerId: 2,
    salesManagerId: 2,
    selectedFilters: [3],
    selectedFans: [5, 6],
    selectedDucts: [8, 9]
  },
  {
    title: "Custom Cyclone Separator - Sawmill Operations",
    endUser: "Alpine Sawmill Group",
    country: "Austria",
    industry: "woodworking",
    customIndustry: null,
    plantType: "Sawmill",
    filterType: "Cyclone with Secondary Filter",
    fanType: "High-Pressure Centrifugal",
    dustType: "Sawdust and Bark",
    ductSystem: "Heavy-Duty Steel Ducting",
    totalExtractionVolume: 80000,
    volumeFlow: 120000,
    customerId: 3,
    salesManagerId: 1,
    selectedFilters: [1, 3],
    selectedFans: [4],
    selectedDucts: [10]
  },
  {
    title: "Multi-Stage Filtration System - Plywood Manufacturing",
    endUser: "Baltic Plywood Industries",
    country: "Finland",
    industry: "woodworking",
    customIndustry: null,
    plantType: "Plywood Production",
    filterType: "Multi-Stage HEPA",
    fanType: "Variable Speed Centrifugal",
    dustType: "Fine Veneer Dust",
    ductSystem: "Stainless Steel Network",
    totalExtractionVolume: 30000,
    volumeFlow: 45000,
    customerId: 4,
    salesManagerId: 2,
    selectedFilters: [2, 3],
    selectedFans: [5, 6],
    selectedDucts: [7, 8]
  },
  {
    title: "Pneumatic Conveying System - MDF Production",
    endUser: "European MDF Solutions",
    country: "Poland",
    industry: "woodworking",
    customIndustry: null,
    plantType: "MDF Manufacturing",
    filterType: "Bag House with Pre-separator",
    fanType: "High-Volume Axial",
    dustType: "MDF Fiber and Dust",
    ductSystem: "Pneumatic Transport Lines",
    totalExtractionVolume: 100000,
    volumeFlow: 150000,
    customerId: 5,
    salesManagerId: 1,
    selectedFilters: [1],
    selectedFans: [4, 6],
    selectedDucts: [9, 10]
  }
];

async function seedSales(prisma) {
  console.log('Seeding sales (which auto-creates processes)...');

  const filterProducts = await prisma.product.findMany({
    where: { category: 'filtersAndSeparators' },
    select: { id: true }
  });
  const fanProducts = await prisma.product.findMany({
    where: { category: 'fanSystems' },
    select: { id: true }
  });
  const ductProducts = await prisma.product.findMany({
    where: { category: 'ductSystems' },
    select: { id: true }
  });

  const salesDataWithRealIds = [
    {
      title: "Advanced Dust Collection System - Cabinet Manufacturing",
      endUser: "Premier Cabinet Works",
      country: "Germany",
      industry: "woodworking",
      customIndustry: null,
      plantType: "Cabinet Manufacturing",
      filterType: "Bag Filter",
      fanType: "Centrifugal",
      dustType: "Fine Wood Particles",
      ductSystem: "Centralized Branch Network",
      totalExtractionVolume: 15000,
      volumeFlow: 25000,
      customerId: 1,
      salesManagerId: 1,
      selectedFilters: [filterProducts[0]?.id, filterProducts[1]?.id].filter(id => id),
      selectedFans: [fanProducts[0]?.id, fanProducts[1]?.id].filter(id => id),
      selectedDucts: [ductProducts[0]?.id].filter(id => id)
    },
    {
      title: "High-Volume Wood Chip Extraction - Furniture Factory",
      endUser: "Scandinavian Furniture Co",
      country: "Sweden",
      industry: "woodworking",
      customIndustry: null,
      plantType: "Furniture Manufacturing",
      filterType: "Cyclone Separator",
      fanType: "Axial",
      dustType: "Wood Chips and Shavings",
      ductSystem: "Main Trunk with Branches",
      totalExtractionVolume: 50000,
      volumeFlow: 75000,
      customerId: 2,
      salesManagerId: 2,
      selectedFilters: [filterProducts[2]?.id].filter(id => id),
      selectedFans: [fanProducts[1]?.id, fanProducts[2]?.id].filter(id => id),
      selectedDucts: [ductProducts[1]?.id, ductProducts[2]?.id].filter(id => id)
    },
    {
      title: "Custom Cyclone Separator - Sawmill Operations",
      endUser: "Alpine Sawmill Group",
      country: "Austria",
      industry: "woodworking",
      customIndustry: null,
      plantType: "Sawmill",
      filterType: "Cyclone with Secondary Filter",
      fanType: "High-Pressure Centrifugal",
      dustType: "Sawdust and Bark",
      ductSystem: "Heavy-Duty Steel Ducting",
      totalExtractionVolume: 80000,
      volumeFlow: 120000,
      customerId: 3,
      salesManagerId: 1,
      selectedFilters: [filterProducts[0]?.id, filterProducts[2]?.id].filter(id => id),
      selectedFans: [fanProducts[0]?.id].filter(id => id),
      selectedDucts: [ductProducts[2]?.id].filter(id => id)
    },
    {
      title: "Multi-Stage Filtration System - Plywood Manufacturing",
      endUser: "Baltic Plywood Industries",
      country: "Finland",
      industry: "woodworking",
      customIndustry: null,
      plantType: "Plywood Production",
      filterType: "Multi-Stage HEPA",
      fanType: "Variable Speed Centrifugal",
      dustType: "Fine Veneer Dust",
      ductSystem: "Stainless Steel Network",
      totalExtractionVolume: 30000,
      volumeFlow: 45000,
      customerId: 4,
      salesManagerId: 2,
      selectedFilters: [filterProducts[1]?.id, filterProducts[2]?.id].filter(id => id),
      selectedFans: [fanProducts[1]?.id, fanProducts[2]?.id].filter(id => id),
      selectedDucts: [ductProducts[0]?.id, ductProducts[1]?.id].filter(id => id)
    },
    {
      title: "Pneumatic Conveying System - MDF Production",
      endUser: "European MDF Solutions",
      country: "Poland",
      industry: "woodworking",
      customIndustry: null,
      plantType: "MDF Manufacturing",
      filterType: "Bag House with Pre-separator",
      fanType: "High-Volume Axial",
      dustType: "MDF Fiber and Dust",
      ductSystem: "Pneumatic Transport Lines",
      totalExtractionVolume: 100000,
      volumeFlow: 150000,
      customerId: 5,
      salesManagerId: 1,
      selectedFilters: [filterProducts[0]?.id].filter(id => id),
      selectedFans: [fanProducts[0]?.id, fanProducts[2]?.id].filter(id => id),
      selectedDucts: [ductProducts[1]?.id, ductProducts[2]?.id].filter(id => id)
    }
  ];
  
  for (const saleData of salesDataWithRealIds) {
    const customer = await prisma.customer.findUnique({
      where: { id: saleData.customerId },
      select: { name: true }
    });

    const lastProcess = await prisma.process.findFirst({
      orderBy: { caseNo: 'desc' },
      select: { caseNo: true }
    });
    const nextCaseNo = (lastProcess?.caseNo || 0) + 1;

    const allSelectedProducts = [
      ...saleData.selectedFilters,
      ...saleData.selectedFans,
      ...saleData.selectedDucts
    ].filter(id => id);

    await prisma.$transaction(async (prisma) => {
      const process = await prisma.process.create({
        data: {
          title: saleData.title,
          caseNo: nextCaseNo,
          status: 'ongoing'
        }
      });

      const sale = await prisma.sale.create({
        data: {
          title: saleData.title,
          endUser: saleData.endUser,
          country: saleData.country,
          industry: saleData.industry,
          customIndustry: saleData.customIndustry,
          plantType: saleData.plantType,
          filterType: saleData.filterType,
          fanType: saleData.fanType,
          dustType: saleData.dustType,
          ductSystem: saleData.ductSystem,
          totalExtractionVolume: saleData.totalExtractionVolume,
          volumeFlow: saleData.volumeFlow,
          processId: process.id,
          customerId: saleData.customerId,
          salesManagerId: saleData.salesManagerId
        }
      });

      if (allSelectedProducts.length > 0) {
        const saleProductData = allSelectedProducts.map(productId => ({
          saleId: sale.id,
          productId: productId,
          quantity: 1
        }));

        await prisma.saleProduct.createMany({
          data: saleProductData
        });
      }

      console.log(`Created sale and process: ${saleData.title} (Case #${nextCaseNo})`);
    });
  }
  
  console.log(`Seeded ${salesData.length} sales with auto-created processes`);
}

module.exports = { seedSales };