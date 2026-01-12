const prisma = require("../utils/prisma");
const encryption = require("../utils/encryption");

// Decrypt customer data
function decryptCustomer(customer) {
  if (!customer) return customer;

  return {
    ...customer,
    name: customer.name ? encryption.decrypt(customer.name) : null,
    website: customer.website ? encryption.decrypt(customer.website) : null,
  };
}

async function getAllCustomers(queryParams = {}) {
  const { industry, country, salesManagerId } = queryParams;

  const whereClause = {};
  if (industry) whereClause.industry = industry;
  if (country) whereClause.country = country;
  if (salesManagerId) whereClause.salesManagerId = parseInt(salesManagerId);

  const customers = await prisma.customer.findMany({
    where: whereClause,
    include: {
      salesManager: true,
      sales: true,
    },
  });

  return customers.map(decryptCustomer);
}

module.exports = {
  getAllCustomers,
};
