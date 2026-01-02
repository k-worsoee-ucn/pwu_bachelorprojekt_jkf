const prisma = require("./prisma");
const encryption = require("../utils/encryption");

async function getAllCustomers(req, res) {
  try {
    const { industry, country, salesManagerId } = req.query;

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

    // Decrypt names and websites
    const decryptedCustomers = customers.map(customer => ({
      ...customer,
      name: customer.name ? encryption.decrypt(customer.name) : null,
      website: customer.website ? encryption.decrypt(customer.website) : null
    }));

    res.json(decryptedCustomers);
  } catch (error) {
    console.error('Error in getAllCustomers:', error);
    res.status(500).json({ error: 'An error occurred processing your request' });
  }
}

async function getCustomerById(req, res) {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        salesManager: true,
        sales: {
          include: {
            process: true,
          },
        },
      },
    });

    if (!customer) return res.status(404).json({ error: "Customer not found" });
    
    // Decrypt name and website
    if (customer.name) {
      customer.name = encryption.decrypt(customer.name);
    }
    if (customer.website) {
      customer.website = encryption.decrypt(customer.website);
    }
    
    res.json(customer);
  } catch (error) {
    console.error('Error in getCustomerById:', error);
    res.status(500).json({ error: 'An error occurred processing your request' });
  }
}

async function createCustomer(req, res) {
  try {
    const { name, industry, country, salesManagerId } = req.body;

    if (!name || !industry || !country || !salesManagerId) {
      return res
        .status(400)
        .json({
          error: "name, industry, country, and salesManagerId are required",
        });
    }

    const customer = await prisma.customer.create({
      data: { 
        name: encryption.encrypt(name), 
        industry, 
        country, 
        salesManagerId,
        website: website ? encryption.encrypt(website) : null
      },
      include: { salesManager: true },
    });

    // Decrypt for response
    customer.name = encryption.decrypt(customer.name);
    if (customer.website) {
      customer.website = encryption.decrypt(customer.website);
    }

    res.status(201).json(customer);
  } catch (error) {
    console.error('Error in createCustomer:', error);
    res.status(500).json({ error: 'An error occurred processing your request' });
  }
}

async function updateCustomer(req, res) {
  try {
    const { name, industry, country, salesManagerId } = req.body;

    const customer = await prisma.customer.update({
      where: { id: parseInt(req.params.id) },
      data: {
        ...(name && { name: encryption.encrypt(name) }),
        ...(industry && { industry }),
        ...(country && { country }),
        ...(salesManagerId && { salesManagerId }),
        ...(website !== undefined && { website: website ? encryption.encrypt(website) : null }),
      },
      include: { salesManager: true },
    });

    // Decrypt for response
    if (customer.name) {
      customer.name = encryption.decrypt(customer.name);
    }
    if (customer.website) {
      customer.website = encryption.decrypt(customer.website);
    }

    res.json(customer);
  } catch (error) {
    console.error('Error in updateCustomer:', error);
    res.status(500).json({ error: 'An error occurred processing your request' });
  }
}

async function deleteCustomer(req, res) {
  try {
    await prisma.customer.delete({ where: { id: parseInt(req.params.id) } });
    res.status(204).send();
  } catch (error) {
    console.error('Error in deleteCustomer:', error);
    res.status(500).json({ error: 'An error occurred processing your request' });
  }
}

async function getCustomerSales(req, res) {
  try {
    const sales = await prisma.sale.findMany({
      where: { customerId: parseInt(req.params.id) },
      include: {
        process: true,
        salesManager: true,
        saleProducts: { include: { product: true } },
      },
    });

    res.json(sales);
  } catch (error) {
    console.error('Error in getCustomerSales:', error);
    res.status(500).json({ error: 'An error occurred processing your request' });
  }
}

module.exports = {
  getAllCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getCustomerSales,
};
