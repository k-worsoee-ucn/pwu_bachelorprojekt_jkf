const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function seedCustomers(salesManagers) {
  
  if (!salesManagers || salesManagers.length === 0) {
    throw new Error('Sales managers must be created before customers')
  }

  const customers = await Promise.all([
    prisma.customer.upsert({
      where: { name: 'Customer 1' },
      update: {},
      create: {
        name: 'Customer 1',
        website: 'https://www.Customer1.com',
        salesManagerId: salesManagers[0].id
      }
    }),
    prisma.customer.upsert({
      where: { name: 'Customer 2' },
      update: {},
      create: {
        name: 'Customer 2',
        website: 'https://www.Customer2.com',
        salesManagerId: salesManagers[1].id
      }
    }),
    prisma.customer.upsert({
      where: { name: 'Customer 3' },
      update: {},
      create: {
        name: 'Customer 3',
        website: 'https://www.Customer3.com',
        salesManagerId: salesManagers[0].id
      }
    }),
    prisma.customer.upsert({
      where: { name: 'Customer 4' },
      update: {},
      create: {
        name: 'Customer 4',
        website: 'https://www.Customer4.com',
        salesManagerId: salesManagers[2].id
      }
    }),
    prisma.customer.upsert({
      where: { name: 'Customer 5' },
      update: {},
      create: {
        name: 'Customer 5',
        website: 'https://www.Customer5.com',
        salesManagerId: salesManagers[1].id
      }
    }),
    prisma.customer.upsert({
      where: { name: 'Customer 6' },
      update: {},
      create: {
        name: 'Customer 6',
        website: 'https://www.Customer6.com',
        salesManagerId: salesManagers[0].id
      }
    }),
    prisma.customer.upsert({
      where: { name: 'Customer 7' },
      update: {},
      create: {
        name: 'Customer 7',
        website: 'https://www.Customer7.com',
        salesManagerId: salesManagers[2].id
      }
    }),
    prisma.customer.upsert({
      where: { name: 'Customer 8' },
      update: {},
      create: {
        name: 'Customer 8',
        website: 'https://www.Customer8.com',
        salesManagerId: salesManagers[1].id
      }
    }),
    prisma.customer.upsert({
      where: { name: 'Customer 9' },
      update: {},
      create: {
        name: 'Customer 9',
        website: 'https://www.Customer9.com',
        salesManagerId: salesManagers[0].id
      }
    }),
    prisma.customer.upsert({
      where: { name: 'Customer 10' },
      update: {},
      create: {
        name: 'Customer 10',
        website: 'https://www.Customer10.com',
        salesManagerId: salesManagers[2].id
      }
    })
  ])

  console.log(`Created ${customers.length} customers`)
  return customers
}

module.exports = { seedCustomers }