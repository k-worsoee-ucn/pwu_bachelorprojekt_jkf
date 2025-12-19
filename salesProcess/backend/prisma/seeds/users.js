const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcrypt')

const prisma = new PrismaClient()

async function seedUsers() {
  
  // Use environment variable for seed password
  const seedPassword = process.env.SEED_PASSWORD
  
  if (!seedPassword) {
    throw new Error('SEED_PASSWORD environment variable is required')
  }

  const hashedPassword = await bcrypt.hash(seedPassword, 10)
  
  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: 'sally@sales.com' },
      update: {},
      create: {
        email: 'sally@sales.com',
        password: hashedPassword,
        name: 'Sally Sales',
        role: 'salesManager'
      }
    }),
    prisma.user.upsert({
      where: { email: 'mark@marketing.com' },
      update: {},
      create: {
        email: 'mark@marketing.com',
        password: hashedPassword,
        name: 'Mark Marketing',
        role: 'marketingManager'
      }
    }),
    prisma.user.upsert({
      where: { email: 'viggo@viewer.com' },
      update: {},
      create: {
        email: 'viggo@viewer.com',
        password: hashedPassword,
        name: 'Viggo Viewer',
        role: 'viewer'
      }
    })
  ])

  console.log(`Created ${users.length} users`)
  return users
}

module.exports = { seedUsers }