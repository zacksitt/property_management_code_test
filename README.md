# 🏢 Property Management Application

A modern property and task management system for property managers and landlords.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Status](https://img.shields.io/badge/status-production%20ready-green)

## ✨ Features

- 🏘️ **Property Management** - Create, edit, delete, and browse properties with pagination
- 📋 **Task Management** - Manage cleaning, maintenance, and inspection tasks
- 🔍 **Advanced Filtering** - Filter tasks by status, type, and property
- 📄 **Pagination** - Efficient browsing of large datasets
- 🎨 **Modern UI** - Responsive design with Tailwind CSS
- 🔒 **Validation** - Comprehensive input validation
- 📚 **API Documentation** - Interactive Swagger docs

## 🚀 Quick Start

### Option 1: Docker (Recommended) 🐳

```bash

cd property_management_code_test
cp .env.example .env

# Start all services
docker-compose up -d

# Access the application
# 🌐 Frontend: http://localhost:8080
# 🔌 Backend API: http://localhost:3000/api
# 📖 Swagger Docs: http://localhost:3000/api/docs
```

### Option 2: Manual Setup 💻

**Prerequisites**: Node.js 18+, PostgreSQL 15+

```bash
# 1. Ensure PostgreSQL is running locally
# Create database: createdb nosbaan_property_db
# Or use psql: CREATE DATABASE nosbaan_property_db;

# 2. Setup Backend (Terminal 1)
cd backend
npm install
cp .env.example .env  # Edit with your settings
npm run migration:run
npm run seed
npm run start:dev

# 3. Setup Frontend (Terminal 2)
cd frontend
npm install
cp .env.example .env
npm run dev

# 🌐 Frontend: http://localhost:5173
# 🔌 Backend: http://localhost:3000/api
```

## 📦 Technology Stack

**Backend**: NestJS • TypeORM • PostgreSQL • TypeScript  
**Frontend**: React • Vite • TanStack Query • Tailwind CSS  
**DevOps**: Docker • Docker Compose

## 📖 Documentation

- **[TECHNICAL_DOCUMENTATION.md](./TECHNICAL_DOCUMENTATION.md)** - Complete technical guide
- **[Backend Module Structure](./backend/src/modules/MODULE_STRUCTURE.md)** - Backend architecture
- **[Database Guide](./backend/src/databases/README.md)** - Database operations
- **[External Services](./backend/src/external-services/ARCHITECTURE.md)** - Third-party integrations

## 🎯 User Stories

**As a property manager**, I want to:
- ✅ Browse and manage properties with pagination
- ✅ Create, edit, and delete properties
- ✅ Track tasks (cleaning, maintenance, inspections)
- ✅ Filter tasks by status and type
- ✅ Assign tasks to team members
- ✅ View all property-related tasks in one place

## 🔧 Common Commands

### Backend
```bash
npm run start:dev       # Start development server
npm run build           # Build for production
npm run test            # Run tests
npm run seed            # Seed sample data
npm run migration:run   # Run database migrations
```

### Frontend
```bash
npm run dev            # Start development server
npm run build          # Build for production
npm run preview        # Preview production build
```

### Docker
```bash
docker-compose up -d              # Start all services
docker-compose down               # Stop all services
docker-compose logs -f backend    # View backend logs
docker-compose exec backend sh    # Access backend container
```

## 🗄️ Database Schema

**Properties**: id, name, address, ownerName, monthlyRent, status  
**Tasks**: id, propertyId, description, type, assignedTo, status, dueDate

See [TECHNICAL_DOCUMENTATION.md](./TECHNICAL_DOCUMENTATION.md) for detailed schema.

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Cannot create task | Run `npm run seed` to create properties first |
| Description too short | Task descriptions must be 10+ characters |
| Price overflow | Max rent: $99,999,999.99 |
| Port already in use | Change PORT in .env or stop conflicting service |

For detailed troubleshooting, see [TECHNICAL_DOCUMENTATION.md](./TECHNICAL_DOCUMENTATION.md).

## 📝 Environment Variables

### Backend
```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=nosbaan
DB_PASSWORD=nosbaan123
DB_DATABASE=nosbaan_property_db
PORT=3000
NODE_ENV=development
```

### Frontend
```env
VITE_API_URL=http://localhost:3000/api
```

## 🧪 Testing

```bash
# Backend tests
cd backend && npm run test

# Frontend tests
cd frontend && npm run test
```

## 📊 Sample Data

The seeder creates:
- **5 Properties** - Various locations and statuses
- **8 Tasks** - Different types and statuses

```bash
npm run seed            # Create sample data
npm run seed:rollback   # Remove sample data
```

## 🤝 Contributing

This is a private project for NOSBAAN Property Management.

## 📄 License

Private and Proprietary

---

**Built with ❤️ for NOSBAAN Property Management**

For detailed technical information, architecture, and advanced features, see **[TECHNICAL_DOCUMENTATION.md](./TECHNICAL_DOCUMENTATION.md)**
