const { PrismaClient } = require('@prisma/client')
const encryption = require('../../utils/encryption')

const prisma = new PrismaClient()

async function seedCustomers(salesManagers) {
  
  if (!salesManagers || salesManagers.length === 0) {
    throw new Error('Sales managers must be created before customers')
  }

  // Clear existing sales records first (they have FK to customers)
  await prisma.sale.deleteMany({})
  
  // Clear existing customers to avoid duplicates when seeding with encrypted names
  await prisma.customer.deleteMany({})

  const customers = await Promise.all([
    prisma.customer.create({
      data: {
        name: encryption.encrypt('Customer 1'),
        website: encryption.encrypt('https://www.Customer1.com'),
        salesManagerId: salesManagers[0].id
      }
    }),
    prisma.customer.create({
      data: {
        name: encryption.encrypt('Customer 2'),
        website: encryption.encrypt('https://www.Customer2.com'),
        salesManagerId: salesManagers[0].id
      }
    }),
    prisma.customer.create({
      data: {
        name: encryption.encrypt('Customer 3'),
        website: encryption.encrypt('https://www.Customer3.com'),
        salesManagerId: salesManagers[0].id
      }
    }),
    prisma.customer.create({
      data: {
        name: encryption.encrypt('Customer 4'),
        website: encryption.encrypt('https://www.Customer4.com'),
        salesManagerId: salesManagers[0].id
      }
    }),
    prisma.customer.create({
      data: {
        name: encryption.encrypt('Customer 5'),
        website: encryption.encrypt('https://www.Customer5.com'),
        salesManagerId: salesManagers[0].id
      }
    }),
    prisma.customer.create({
      data: {
        name: encryption.encrypt('Customer 6'),
        website: encryption.encrypt('https://www.Customer6.com'),
        salesManagerId: salesManagers[0].id
      }
    }),
    prisma.customer.create({
      data: {
        name: encryption.encrypt('Customer 7'),
        website: encryption.encrypt('https://www.Customer7.com'),
        salesManagerId: salesManagers[0].id
      }
    }),
    prisma.customer.create({
      data: {
        name: encryption.encrypt('Customer 8'),
        website: encryption.encrypt('https://www.Customer8.com'),
        salesManagerId: salesManagers[0].id
      }
    }),
    prisma.customer.create({
      data: {
        name: encryption.encrypt('Customer 9'),
        website: encryption.encrypt('https://www.Customer9.com'),
        salesManagerId: salesManagers[0].id
      }
    }),
    prisma.customer.create({
      data: {
        name: encryption.encrypt('Customer 10'),
        website: encryption.encrypt('https://www.Customer10.com'),
        salesManagerId: salesManagers[0].id
      }
    })
  ])

  console.log(`Created ${customers.length} customers`)
  return customers
}

module.exports = { seedCustomers }