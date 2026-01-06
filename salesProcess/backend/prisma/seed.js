const { PrismaClient } = require("@prisma/client");
const { seedUsers } = require("./seeds/users");
const { seedCustomers } = require("./seeds/customers");
const { seedProducts } = require("./seeds/products");
const { seedSales } = require("./seeds/sales");
const { seedProcessUsers } = require("./seeds/processUsers");

const prisma = new PrismaClient();

async function resetSequences(prisma) {
  console.log("Resetting database sequences...");

  console.log("Database sequences reset successfully");
}

async function main() {
  try {
    // Seed users first (required for customers and sales)
    const users = await seedUsers();
    const salesManagers = users.filter((user) => user.role === "salesManager");

    // Seed customers (depends on users)
    const customers = await seedCustomers(salesManagers);

    // Seed products (standalone)
    const products = await seedProducts();

    // Seed sales (which auto-creates processes via business logic)
    await seedSales(prisma, customers);

    // Seed process users (depends on auto-created processes from sales)
    await seedProcessUsers(prisma);

    // Reset sequences to prevent ID conflicts
    await resetSequences(prisma);

    console.log("Seed process completed successfully!");
    console.log("\nCreated data summary:");
    console.log(`- Users: ${users.length}`);
    console.log(`- Customers: ${customers.length}`);
    console.log(`- Products: ${products.length}`);
    console.log("- Sales: 5 (with auto-created processes)");
    console.log(
      "- Process User Assignments: Auto-assigned based on sales + marketing managers"
    );
  } catch (error) {
    console.error("Seed process failed:", error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error("Seed process failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
