# Sales Process Application

A full-stack web application for managing sales processes, products, customers, and cases. This application provides a comprehensive platform for tracking and managing the entire sales workflow with user authentication, role-based access control, and data management capabilities.

## 📋 Project Overview

This is a bachelor project that implements a complete sales process management system with:
- **Backend API**: Node.js/Express server with PostgreSQL database and Prisma ORM
- **Frontend**: Vue.js 3 web application with Vite build tool
- **Docker Support**: Containerized deployment with Docker and Docker Compose
- **Authentication**: JWT-based authentication with bcrypt password hashing and secure token storage
- **Security**: Helmet, CORS, rate limiting, input validation with Express-validator and Joi, AES-256-GCM data encryption, step-level authorization, and automated security audits with SBOM generation
- **Testing**: Jest unit and integration tests with Supertest HTTP assertion library and watch mode for continuous testing
- **Data Management**: Prisma ORM with migrations and seeding capabilities

## 🏗️ Architecture

### Project Structure

```
salesProcess/
├── backend/                 # Node.js/Express API server
│   ├── controllers/        # Business logic for each entity
│   ├── routes/            # API route definitions
│   ├── middleware/        # Authentication, validation, authorization
│   ├── prisma/            # Database schema and migrations
│   │   └── seeds/         # Seed data for development
│   ├── tests/             # Jest unit and integration tests
│   ├── utils/             # Utility functions (encryption, etc.)
│   ├── config/            # Configuration files (multer, etc.)
│   ├── server.js          # Express app setup and initialization
│   └── package.json       # Backend dependencies
│
├── frontend/              # Vue.js web application
│   ├── src/
│   │   ├── components/    # Reusable Vue components
│   │   ├── views/         # Page-level components
│   │   ├── router/        # Vue Router configuration
│   │   ├── composables/   # Vue 3 composables
│   │   ├── scss/          # Stylesheet modules
│   │   ├── css/           # Global styles
│   │   ├── assets/        # Static assets
│   │   ├── main.js        # Vue app entry point
│   │   └── App.vue        # Root component
│   ├── index.html         # HTML template
│   ├── vite.config.js     # Vite build configuration
│   └── package.json       # Frontend dependencies
│
├── docker-compose.yml     # Docker Compose configuration
├── .env                   # Environment variables
└── .github/workflows/     # CI/CD workflows
```

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ and npm/yarn
- PostgreSQL 12+ (or Docker)
- Docker and Docker Compose (optional, for containerized setup)

### Installation & Setup

#### Option 1: Docker Compose (Recommended)

The easiest way to get started is using Docker Compose, which sets up the entire stack automatically with persistent image storage.

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd salesProcess
   ```

2. **Set up environment files**
   
   Create environment files by copying the provided `.env.example` files:
   
   ```bash
   # Root directory
   cp .env.example .env
   
   # Backend directory
   cp backend/.env.example backend/.env
   cp backend/.env.test.example backend/.env.test
   
   # Frontend directory
   cp frontend/.env.example frontend/.env
   ```
   
   Then configure each `.env` file with your specific values:
   - **Root `.env`** - Database connection, ports, JWT secret, and registration access code
   - **Backend `backend/.env`** - Database URL, encryption key, and API configuration
   - **Backend `backend/.env.test`** - Test database configuration (for running tests)
   - **Frontend `frontend/.env`** - API base URL for backend communication
   
   > **Note**: The `.env.example` files contain template values with descriptions. See each file for detailed documentation on required environment variables.

3. **Start all services**
   ```bash
   docker-compose up -d --build
   ```

   The application will be available at:
   - **Frontend**: http://localhost:5173
   - **Backend API**: http://localhost:3000
   - **Prisma Studio**: http://localhost:5555

   **Data Persistence**: 
   - Database data persists in the `postgres_data` Docker volume
   - Uploaded images persist in the `backend_uploads` Docker volume

#### Option 2: Local Development

If you prefer to run services locally without Docker:

1. **Backend Setup**
   ```bash
   cd backend
   npm install
   
   # Configure .env file with your local PostgreSQL settings
   # (See accompanying report for environment variable documentation)
   
   # Push schema to database
   npm run prisma:push:local
   
   # Seed database with initial data
   npm run prisma:seed
   
   # Start backend server
   npm run dev
   ```

2. **Frontend Setup** (in a new terminal)
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

   Frontend will be available at http://localhost:5173

## 📚 API Endpoints

The backend provides RESTful API endpoints organized by entity:

### Available Routes
- **Users** (`/api/users`) - User management and authentication
- **Processes** (`/api/processes`) - Sales process management
- **Sales** (`/api/sales`) - Sales data and tracking
- **Customers** (`/api/customers`) - Customer information
- **Products** (`/api/products`) - Product catalog
- **Cases** (`/api/cases`) - Case management
- **Images** (`/api/processes/:processId/images`) - Image upload and management

All API endpoints require authentication via JWT token in the `Authorization` header.

## 🔐 Authentication

The application uses JWT (JSON Web Tokens) for authentication:

1. **Sign Up/Login**: Users can register or log in via the frontend
2. **JWT Token**: Upon successful authentication, a JWT token is returned
3. **Token Storage**: Token is stored in secure HTTP-only cookies
4. **Protected Routes**: All API routes require a valid JWT token
5. **Role-Based Access**: Some routes have step-level authorization

## 🗄️ Database

### Technology Stack
- **Database**: PostgreSQL
- **ORM**: Prisma Client
- **Migrations**: Prisma Migrations

### Database Schema
The schema includes the following main entities:
- **User**: User accounts with authentication
- **Process**: Sales process records
- **Sales**: Sales transactions
- **Customer**: Customer information
- **Product**: Product catalog
- **Case**: Case management
- **Reference**: Reference data
- **ProcessUser**: User assignments to processes (with role/step tracking)

### Database Commands

```bash
# Generate Prisma client
npm run prisma:generate

# Push schema to database (dev only - accepts data loss)
npm run prisma:push

# Deploy migrations
npm run prisma:migrate

# Seed database with sample data
npm run prisma:seed

# Open Prisma Studio (interactive database browser)
npx prisma studio
```

### Database Seeding

The database includes seeding functionality to populate the application with sample data, allowing you to explore the application without creating users and processes from scratch.

**What the Seeding Does:**
- **Users**: Creates sample user accounts with different roles (sales manager, marketing manager, viewer)
- **Customers**: Generates sample customer records associated with sales managers
- **Products**: Populates the product catalog with sample items
- **Sales**: Creates sample sales transactions that automatically trigger process creation
- **Process Users**: Assigns users to auto-created processes based on sales data and user roles

**Key Benefit**: This allows you to immediately log in with pre-created accounts and view existing processes, sales, customers, and products without needing to set up data manually first.

**Seed Files:**
- `seed.js` - Main seeding orchestrator that coordinates all individual seeders
- `seeds/users.js` - Creates sample user accounts
- `seeds/customers.js` - Creates sample customer data
- `seeds/products.js` - Creates sample product catalog
- `seeds/sales.js` - Creates sample sales and automatically generates processes
- `seeds/processUsers.js` - Assigns users to processes

**Running the Seed:**
```bash
# Docker Compose automatically runs seeding on first startup
# For local development:
npm run prisma:seed
```

## 🧪 Testing

Backend includes Jest test suite with unit and integration tests:

```bash
cd backend

# Run tests once
npm run test

# Run tests in watch mode (auto-rerun on file changes)
npm run test:watch
```

Test files are located in `backend/tests/`:
- `auth.test.js` - Authentication tests
- `database.test.js` - Database integration tests
- `process.authorization.test.js` - Authorization tests

**Testing Technologies:**
- **Jest** - Testing framework and test runner
- **Supertest** - HTTP assertion library for API endpoint testing

## 🛠️ Development

### Backend Development

```bash
cd backend

# Install dependencies
npm install

# Start development server with auto-reload
npm run dev

# Run tests
npm test

# Generate new Prisma migration
npx prisma migrate dev --name migration_name
```

### Frontend Development

```bash
cd frontend

# Install dependencies
npm install

# Start development server with HMR
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📦 Frontend Components

Key Vue components and their purposes:

- **Header.vue** - Navigation header
- **SignIn.vue** - User login form
- **SignUp.vue** - User registration form
- **ProcessCard.vue** - Sales process card display
- **TabHeader.vue** - Tab navigation
- **ProductionStep.vue** - Production workflow step
- **SalesStep.vue** - Sales workflow step
- **ProdImgStep.vue** - Product image upload step
- **CaseUploadStep.vue** - Case document upload step
- **CaseRefStep.vue** - Case reference step
- **InstallImgStep.vue** - Installation image step
- **FilterModal.vue** - Data filtering interface

## 🔄 Deployment

### Production Build

**Backend:**
```bash
cd backend
NODE_ENV=production npm start
```

**Frontend:**
```bash
cd frontend
npm run build
# Output in dist/ directory
```

### Docker Deployment

The project includes production-ready Dockerfiles for both services:

```bash
# Build and run with Docker Compose
docker-compose -f docker-compose.yml up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## � Dependencies

### Backend Dependencies

**Production:**
- `@prisma/client` (^6.19.0) - Prisma ORM client
- `express` (^5.1.0) - Web application framework
- `bcrypt` (^6.0.0) - Password hashing library
- `jsonwebtoken` (^9.0.2) - JWT creation and verification
- `dotenv` (^17.2.3) - Environment variable management
- `helmet` (^8.1.0) - HTTP headers security
- `cors` (^2.8.5) - Cross-Origin Resource Sharing
- `express-validator` (^7.3.1) - Input validation middleware
- `joi` (^18.0.2) - Schema validation
- `express-rate-limit` (^8.2.1) - API rate limiting
- `multer` (^2.0.2) - File upload handling
- `cookie-parser` (^1.4.7) - Cookie parsing middleware
- `pg` (^8.16.3) - PostgreSQL client

**Development:**
- `nodemon` (^3.1.11) - Development server with auto-reload
- `jest` (^30.2.0) - Testing framework
- `supertest` (^7.1.4) - HTTP assertion library for API testing
- `prisma` (^6.19.0) - Prisma CLI and development tools
- `@cyclonedx/cyclonedx-npm` (^4.1.1) - SBOM generation
- `cross-env` (^7.0.3) - Cross-platform environment variable setting

### Frontend Dependencies

**Production:**
- `vue` (^3.5.24) - JavaScript framework
- `vue-router` (^4.6.3) - Client-side routing
- `@vueup/vue-quill` (^1.2.0) - Rich text editor
- `jspdf` (^4.0.0) - PDF generation
- `jszip` (^3.10.1) - ZIP file creation
- `countries-list` (^3.2.2) - Country data

**Development:**
- `vite` (^7.2.2) - Build tool and dev server
- `@vitejs/plugin-vue` (^6.0.1) - Vue 3 support for Vite
- `sass` (^1.94.2) - SCSS preprocessor
- `sass-loader` (^16.0.6) - Sass loader for Vite

## �🔒 Security Features

- **Helmet**: HTTP headers security
- **CORS**: Cross-Origin Resource Sharing configuration
- **Rate Limiting**: API rate limiting to prevent abuse
- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for secure password storage
- **Data Validation**: Express-validator and Joi for input validation
- **Data Encryption**: AES-256-GCM encryption for sensitive data at rest
- **Step-Level Authorization**: Role and step-based access control
- **SBOM Generation**: Software Bill of Materials for supply chain security
- **Security Audits**: Automated vulnerability scanning

### Security Commands

```bash
cd backend

# Generate SBOM (Software Bill of Materials)
npm run sbom:generate

# Validate dependencies for vulnerabilities
npm run sbom:validate

# Run full security check (SBOM + audit)
npm run security:check
```

## � Environment Configuration

Environment variables are configured through `.env` files in different locations:

### Root Level
- **File**: `.env` (root directory)
- **Documentation**: See accompanying report for template and configuration details

### Backend
- **File**: `backend/.env` (development configuration)
- **File**: `backend/.env.test` (testing configuration)
- **Documentation**: See accompanying report for templates and configuration details

## 🐛 Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running
- Verify `DATABASE_URL` is correctly configured
- Check database user permissions
- Run `npm run prisma:push` to sync schema

### Frontend Not Loading
- Check if Vite dev server is running (`npm run dev`)
- Verify `CORS_ORIGIN` in backend `.env` includes frontend URL
- Clear browser cache and restart dev server

### Docker Issues
- Ensure Docker and Docker Compose are installed
- Run `docker-compose down` to clean up
- Check logs with `docker-compose logs -f service_name`
- Verify `.env` file is configured in root directory

### Authentication Problems
- Verify `JWT_SECRET` is set in backend `.env`
- Check JWT token expiration
- Clear cookies and login again

---

**Last Updated**: January 2026
