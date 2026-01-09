const prisma = require("../utils/prisma");
const encryption = require("../utils/encryption");

// Helper function to decrypt customer data
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

  // Decrypt all customers
  return customers.map(decryptCustomer);
}

async function getCustomerById(customerId) {
  const customer = await prisma.customer.findUnique({
    where: { id: parseInt(customerId) },
    include: {
      salesManager: true,
      sales: {
        include: {
          process: true,
        },
      },
    },
  });

  if (!customer) {
    throw { status: 404, message: "Customer not found" };
  }

  return decryptCustomer(customer);
}

async function createCustomer(customerData) {
  const { name, industry, country, salesManagerId, website } = customerData;

  // Validation
  if (!name || !industry || !country || !salesManagerId) {
    throw {
      status: 400,
      message: "name, industry, country, and salesManagerId are required",
    };
  }

  // Verify sales manager exists
  const salesManager = await prisma.user.findUnique({
    where: { id: salesManagerId },
    select: { id: true },
  });

  if (!salesManager) {
    throw { status: 400, message: "Sales manager not found" };
  }

  const customer = await prisma.customer.create({
    data: {
      name: encryption.encrypt(name),
      industry,
      country,
      salesManagerId,
      website: website ? encryption.encrypt(website) : null,
    },
    include: { salesManager: true },
  });

  return decryptCustomer(customer);
}

async function updateCustomer(customerId, updateData) {
  const { name, industry, country, salesManagerId, website } = updateData;

  // Verify customer exists
  const existingCustomer = await prisma.customer.findUnique({
    where: { id: parseInt(customerId) },
  });

  if (!existingCustomer) {
    throw { status: 404, message: "Customer not found" };
  }

  // Verify sales manager exists if provided
  if (salesManagerId) {
    const salesManager = await prisma.user.findUnique({
      where: { id: salesManagerId },
      select: { id: true },
    });

    if (!salesManager) {
      throw { status: 400, message: "Sales manager not found" };
    }
  }

  const customer = await prisma.customer.update({
    where: { id: parseInt(customerId) },
    data: {
      ...(name && { name: encryption.encrypt(name) }),
      ...(industry && { industry }),
      ...(country && { country }),
      ...(salesManagerId && { salesManagerId }),
      ...(website !== undefined && {
        website: website ? encryption.encrypt(website) : null,
      }),
    },
    include: { salesManager: true },
  });

  return decryptCustomer(customer);
}

async function deleteCustomer(customerId) {
  // Verify customer exists
  const existingCustomer = await prisma.customer.findUnique({
    where: { id: parseInt(customerId) },
  });

  if (!existingCustomer) {
    throw { status: 404, message: "Customer not found" };
  }

  await prisma.customer.delete({
    where: { id: parseInt(customerId) },
  });
}

async function getCustomerSales(customerId) {
  // Verify customer exists
  const customer = await prisma.customer.findUnique({
    where: { id: parseInt(customerId) },
    select: { id: true },
  });

  if (!customer) {
    throw { status: 404, message: "Customer not found" };
  }

  const sales = await prisma.sale.findMany({
    where: { customerId: parseInt(customerId) },
    include: {
      process: true,
      salesManager: true,
      saleProducts: { include: { product: true } },
    },
  });

  return sales;
}

module.exports = {
  getAllCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getCustomerSales,
};
