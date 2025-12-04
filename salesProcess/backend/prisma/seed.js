const { PrismaClient } = require('@prisma/client')
const { seedUsers } = require('./seeds/users')
const { seedCustomers } = require('./seeds/customers')
const { seedProducts } = require('./seeds/products')
const { seedSales } = require('./seeds/sales') // Now correctly named
const { seedProcessUsers } = require('./seeds/processUsers')
const { seedReferences } = require('./seeds/references')
const { seedCases } = require('./seeds/cases')

const prisma = new PrismaClient()

async function main() {

  try {
    // Seed users first (required for customers and sales)
    const users = await seedUsers()
    const salesManagers = users.filter(user => user.role === 'salesManager')

    // Seed customers (depends on users)
    const customers = await seedCustomers(salesManagers)

    // Seed products (standalone)
    const products = await seedProducts()

    // Seed sales (which auto-creates processes via business logic)
    await seedSales(prisma)

    // Seed process users (depends on auto-created processes from sales)
    await seedProcessUsers(prisma)

    // Seed references (depends on processes)
    await seedReferences(prisma)

    // Seed cases (depends on processes and references)
    await seedCases(prisma)

    console.log('Seed process completed successfully!')
    console.log('\nCreated data summary:')
    console.log(`- Users: ${users.length}`)
    console.log(`- Customers: ${customers.length}`)
    console.log(`- Products: ${products.length}`)
    console.log('- Sales: 5 (with auto-created processes)')
    console.log('- Process User Assignments: Auto-assigned based on sales + marketing managers')
    console.log('- References: 5')
    console.log('- Cases: 7')
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