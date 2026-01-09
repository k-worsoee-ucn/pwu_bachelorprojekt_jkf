const express = require("express");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const path = require("path");
const { PrismaClient } = require("@prisma/client");
require("dotenv").config();

// Import middleware
const corsMiddleware = require("./middleware/cors");

// Import routes
const processRoutes = require("./routes/process.routes");
const salesRoutes = require("./routes/sales.routes");
const customerRoutes = require("./routes/customer.routes");
const userRoutes = require("./routes/user.routes");
const productRoutes = require("./routes/product.routes");
const referenceRoutes = require("./routes/reference.routes");
const caseRoutes = require("./routes/case.routes");
const imageRoutes = require("./routes/image.routes");

const app = express();
const PORT = process.env.PORT || 3000;

const prisma = new PrismaClient();

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://cdnjs.cloudflare.com", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "blob:", "http://localhost:*"],
        connectSrc: ["'self'", "http://localhost:*"],
      },
    },
    noSniff: true,
    frameguard: { action: 'deny' },
    xssFilter: true,
  })
);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: { error: "Too many requests" },
});

app.use("/api/", limiter);

app.use(corsMiddleware);

app.use(express.json());

app.use(cookieParser());

// Serve static files from uploads directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Basic route
app.get("/", (req, res) => {
  res.json({ message: "Sales Process API is running!" });
});

// Health check route
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

// Routes
app.use("/api/processes", processRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/references", referenceRoutes);
app.use("/api/cases", caseRoutes);
app.use("/api", imageRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error("Global error:", err);

  // Always return generic message to client, don't expose details
  res.status(500).json({ error: "An error occurred processing your request" });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Start server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
  console.log("Prisma Client initialized");
});

// Graceful shutdown
process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});
