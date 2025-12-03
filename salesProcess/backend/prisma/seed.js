const { PrismaClient } = require('@prisma/client')
const { seedUsers } = require('./seeds/users')
const { seedCustomers } = require('./seeds/customers')

const prisma = new PrismaClient()

async function main() {

  try {
    const users = await seedUsers()
    const salesManagers = users.filter(user => user.role === 'salesManager')
    const customers = await seedCustomers(salesManagers)

    console.log(`- Users: ${users.length}`)
    console.log(`- Customers: ${customers.length}`)
  } catch (error) {
    console.error('Seed process failed:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error('Seed process failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })