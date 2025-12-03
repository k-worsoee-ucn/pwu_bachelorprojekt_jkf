const { PrismaClient } = require('@prisma/client')
const { seedUsers } = require('./seeds/users')
const { seedCustomers } = require('./seeds/customers')
const { seedProducts } = require('./seeds/products')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed process...')

  try {
    // Seed users first (required for customers)
    const users = await seedUsers()
    const salesManagers = users.filter(user => user.role === 'salesManager')

    // Seed customers (depends on users)
    const customers = await seedCustomers(salesManagers)

    // Seed products (add dependencies if needed)
    const products = await seedProducts(/* pass dependencies here */)

    console.log('🎉 Seed process completed successfully!')
    console.log('\nCreated data summary:')
    console.log(`- Users: ${users.length}`)
    console.log(`- Customers: ${customers.length}`)
    console.log(`- Products: ${products.length}`)
  } catch (error) {
    console.error('❌ Seed process failed:', error)
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