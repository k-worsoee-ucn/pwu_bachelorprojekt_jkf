const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcrypt')

const prisma = new PrismaClient()

async function seedUsers() {
  
  // Use environment variable for seed password
  const seedPassword = process.env.SEED_PASSWORD

  const hashedPassword = await bcrypt.hash(seedPassword, 10)
  
  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: 'john.smith@salesmanager.com' },
      update: {},
      create: {
        email: 'john.smith@salesmanager.com',
        password: hashedPassword,
        name: 'John Smith',
        role: 'salesManager'
      }
    }),
    prisma.user.upsert({
      where: { email: 'sarah.johnson@salesmanager.com' },
      update: {},
      create: {
        email: 'sarah.johnson@salesmanager.com',
        password: hashedPassword,
        name: 'Sarah Johnson',
        role: 'salesManager'
      }
    }),
    prisma.user.upsert({
      where: { email: 'mike.davis@salesmanager.com' },
      update: {},
      create: {
        email: 'mike.davis@salesmanager.com',
        password: hashedPassword,
        name: 'Mike Davis',
        role: 'salesManager'
      }
    }),
    prisma.user.upsert({
      where: { email: 'anna.wilson@marketing.com' },
      update: {},
      create: {
        email: 'anna.wilson@marketing.com',
        password: hashedPassword,
        name: 'Anna Wilson',
        role: 'marketingManager'
      }
    }),
    prisma.user.upsert({
      where: { email: 'tom.brown@viewer.com' },
      update: {},
      create: {
        email: 'tom.brown@viewer.com',
        password: hashedPassword,
        name: 'Tom Brown',
        role: 'viewer'
      }
    })
  ])

  console.log(`Created ${users.length} users`)
  return users
}

module.exports = { seedUsers }