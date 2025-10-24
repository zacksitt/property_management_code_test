# 📚 Technical Documentation

Comprehensive technical guide for the Property Management Application.

## 📑 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Project Structure](#project-structure)
3. [Backend Architecture](#backend-architecture)
4. [Frontend Architecture](#frontend-architecture)
5. [Database Design](#database-design)
6. [API Reference](#api-reference)
7. [Development Guide](#development-guide)
8. [Testing](#testing)
9. [Deployment](#deployment)
10. [Troubleshooting](#troubleshooting)

---

## 🏗️ Architecture Overview

### System Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                         Frontend Layer                                │
│                   React + TanStack Query + Vite                       │
│                                                                        │
│  • Property Management    • Task Management    • Dashboard & Reports  │
└──────────────────────────────┬───────────────────────────────────────┘
                               │ REST API (HTTP/JSON)
                               ▼
┌──────────────────────────────────────────────────────────────────────┐
│                     Backend Layer (NestJS)                            │
│                                                                        │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────────────┐ │
│  │ Properties   │  │    Tasks     │  │   External Services        │ │
│  │   Module     │  │   Module     │  │       Module               │ │
│  │              │  │              │  │                            │ │
│  │ • CRUD ops   │  │ • CRUD ops   │  │ ┌────────────────────────┐ │ │
│  │ • Filtering  │  │ • Assignment │  │ │  Integration Layer     │ │ │
│  │ • Validation │  │ • Status     │  │ │                        │ │ │
│  │ • Pagination │  │ • Filtering  │  │ │ • Hostaway Adapter     │ │ │
│  └──────┬───────┘  └──────┬───────┘  │ │ • Operto Adapter       │ │ │
│         │                 │           │ │ • Notion Adapter       │ │ │
│         │                 │           │ │ • Email Service        │ │ │
│         │                 │           │ │ • Storage Service      │ │ │
│         └─────────────────┼───────────┤ └────────────────────────┘ │ │
│                           │           │                            │ │
│                           ▼           └────────────┬───────────────┘ │
│                  ┌─────────────────┐               │                 │
│                  │ Database Module │               │                 │
│                  │   (TypeORM)     │               │                 │
│                  └────────┬────────┘               │                 │
└───────────────────────────┼────────────────────────┼─────────────────┘
                            │                        │
                            ▼                        ▼
              ┌──────────────────────┐  ┌─────────────────────────────┐
              │    PostgreSQL        │  │   Third-Party Services      │
              │                      │  │                             │
              │ • Properties Table   │  │ • Hostaway API (PMS)        │
              │ • Tasks Table        │  │ • Operto Teams (Locks)      │
              │ • Sync Logs          │  │ • Notion API (Tasks)        │
              │ • Webhook Events     │  │ • Google Workspace          │
              │ • Audit Trails       │  │ • Email (SendGrid/SES)      │
              └──────────────────────┘  │ • Cloud Storage (S3)        │
                                        └─────────────────────────────┘
```

**External Services Integration Strategy:**

| Service | Purpose | Integration Type | Data Flow |
|---------|---------|------------------|-----------|
| **Hostaway API** | Property & booking sync | REST API + Webhooks | Bidirectional sync of property data, bookings, guest info |
| **Operto Teams** | Smart lock automation | REST API | Automated PIN generation, check-in/out coordination |
| **Notion API** | Task sync & documentation | REST API | Task status sync, documentation updates |
| **Google Workspace** | Email & collaboration | OAuth 2.0 + API | Email notifications, calendar integration |
| **Email Service** | Notifications | SMTP/API | Task assignments, booking alerts, reports |
| **Cloud Storage** | Documents & images | S3/Azure API | Property photos, contracts, inspection reports |

**Architecture Principles for Scalability (1,000+ Properties):**

1. **Adapter Pattern** - Each external service has its own adapter for easy replacement/updates
2. **Queue System** - Background job processing for heavy operations (webhooks, sync)
3. **Caching Layer** - Redis for frequently accessed data (property lists, availability)
4. **Event-Driven** - Webhook handlers for real-time updates from external systems
5. **Rate Limiting** - Respect API limits and implement retry mechanisms
6. **Database Indexing** - Optimized queries for large datasets
7. **Horizontal Scaling** - Stateless backend design for multiple instances

**Data Flow Example (Hostaway Booking Sync):**
1. New booking created in Hostaway
2. Hostaway sends webhook to our system
3. External Services Module receives webhook
4. Validates and transforms data using Hostaway Adapter
5. Properties Module updates property status
6. Tasks Module auto-creates cleaning/preparation tasks
7. Operto integration generates smart lock PIN
8. Email service notifies team members
9. Frontend reflects changes via real-time query invalidation

### Design Principles

- **Separation of Concerns** - Clear layers (Controller, Service, Repository)
- **Dependency Injection** - NestJS DI container
- **Type Safety** - Full TypeScript coverage
- **Clean Architecture** - Organized, maintainable code
- **API First** - RESTful API with Swagger documentation

---

## 📁 Project Structure

### Complete Directory Tree

```
property-management-app/
├── backend/
│   └── src/
│       ├── modules/              # Feature modules
│       │   ├── properties/
│       │   │   ├── controllers/
│       │   │   ├── services/
│       │   │   │   ├── properties.service.ts
│       │   │   │   └── tests/
│       │   │   ├── dto/
│       │   │   └── documentation/
│       │   └── tasks/
│       │       ├── controllers/
│       │       ├── services/
│       │       │   ├── tasks.service.ts
│       │       │   └── tests/
│       │       ├── dto/
│       │       └── documentation/
│       │
│       ├── databases/            # Database layer
│       │   ├── typeorm/
│       │   │   ├── entities/
│       │   │   ├── migrations/
│       │   │   ├── seeds/
│       │   │   └── scripts/
│       │   └── database.module.ts
│       │
│       ├── external-services/   # Third-party integrations
│       ├── common/              # Shared utilities
│       └── main.ts
│
├── frontend/
│   └── src/
│       ├── pages/
│       ├── components/
│       ├── services/
│       └── types/
│
└── docker-compose.yml
```

---

## 🎯 Backend Architecture

### Module Structure Pattern

Each module follows this standardized structure:

```
module-name/
├── controllers/                # HTTP layer
│   └── module-name.controller.ts
│
├── services/                    # Business logic layer
│   ├── module-name.service.ts  # Core service
│   └── tests/                  # Unit tests
│       └── module-name.service.spec.ts
│
├── dto/                         # Data Transfer Objects
│   ├── create-module.dto.ts
│   └── update-module.dto.ts
│
├── documentation/               # API documentation
│   └── module-name.decorators.ts
│
└── module-name.module.ts       # Module definition
```

### Controller Layer

**Responsibilities:**
- Handle HTTP requests/responses
- Route definitions
- Request validation
- Response formatting

**Example:**
```typescript
@Controller('properties')
export class PropertiesController {
  @Get()
  @ApiFindAllProperties()
  findAll(@Query('page') page?: number) {
    return this.propertiesService.findAll({ page });
  }
}
```

### Service Layer

**Responsibilities:**
- Business logic implementation
- Data validation
- Database operations
- Transaction management

**Example:**
```typescript
@Injectable()
export class PropertiesService {
  async findAll(options?: { page?: number; limit?: number }) {
    // Business logic here
    return { data, total, page, limit, totalPages };
  }
}
```

### DTO Layer

**Responsibilities:**
- Input validation
- Type safety
- API contract definition

**Example:**
```typescript
export class CreatePropertyDto {
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  name: string;

  @IsNumber()
  @IsPositive()
  @Max(99999999.99)
  monthlyRent: number;
}
```

### Documentation Layer

**Responsibilities:**
- Swagger/OpenAPI documentation
- Keep controllers clean
- Reusable decorators

**Example:**
```typescript
export function ApiFindAllProperties() {
  return applyDecorators(
    ApiOperation({ summary: 'Get all properties with pagination' }),
    ApiQuery({ name: 'page', required: false }),
    ApiResponse({ status: 200, description: 'Paginated list' }),
  );
}
```

---

## 🎨 Frontend Architecture

### Component Structure

```
components/
├── PropertyForm.tsx    # Create/Edit property (modal)
├── TaskForm.tsx        # Create/Edit task (modal)
└── ConfirmDialog.tsx   # Reusable confirmation dialog

pages/
├── PropertyList.tsx    # Properties grid with pagination
└── TaskList.tsx        # Tasks list with filters & pagination

services/
└── api.ts             # Axios client with API methods

types/
└── index.ts           # TypeScript definitions
```

### State Management

Using **TanStack Query** (React Query) for:
- Server state caching
- Automatic refetching
- Optimistic updates
- Cache invalidation

**Example:**
```typescript
const { data } = useQuery({
  queryKey: ['properties', page, limit],
  queryFn: async () => {
    const response = await propertyAPI.getAll({ page, limit });
    return response.data;
  },
});
```

### Pagination Pattern

```typescript
// Backend returns
{
  data: [...],      // Array of items
  total: 100,       // Total count
  page: 1,          // Current page
  limit: 10,        // Items per page
  totalPages: 10    // Total pages
}

// Frontend extracts
const items = data?.data || [];
const total = data?.total || 0;
```

---

## 🗄️ Database Design

### Entity Relationship Diagram

```
┌─────────────────────┐
│     Properties      │
├─────────────────────┤
│ id (PK)             │
│ name                │
│ address             │
│ ownerName           │
│ monthlyRent         │
│ status              │
│ createdAt           │
│ updatedAt           │
└──────────┬──────────┘
           │ 1
           │
           │ *
┌──────────┴──────────┐
│       Tasks         │
├─────────────────────┤
│ id (PK)             │
│ propertyId (FK)     │
│ description         │
│ type                │
│ assignedTo          │
│ status              │
│ dueDate             │
│ createdAt           │
│ updatedAt           │
└─────────────────────┘
```

### Detailed Schema

#### Properties Table

```sql
CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  address VARCHAR(200) NOT NULL,
  owner_name VARCHAR(100) NOT NULL,
  monthly_rent DECIMAL(10,2) NOT NULL CHECK (monthly_rent > 0 AND monthly_rent <= 99999999.99),
  status VARCHAR(20) NOT NULL CHECK (status IN ('VACANT', 'OCCUPIED', 'MAINTENANCE')),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_properties_status ON properties(status);
CREATE INDEX idx_properties_created_at ON properties(created_at);
```

#### Tasks Table

```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  description TEXT NOT NULL CHECK (LENGTH(description) >= 10),
  type VARCHAR(20) NOT NULL CHECK (type IN ('CLEANING', 'MAINTENANCE', 'INSPECTION')),
  assigned_to VARCHAR(100) NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('PENDING', 'IN_PROGRESS', 'DONE')),
  due_date TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tasks_property_id ON tasks(property_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_type ON tasks(type);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
```

### Database Constraints

| Field | Constraint | Reason |
|-------|------------|--------|
| Property.monthlyRent | Max: 99,999,999.99 | DECIMAL(10,2) limit |
| Task.description | Min: 10 characters | Ensure meaningful descriptions |
| Task.propertyId | Cannot be updated | Maintain referential integrity |
| Tasks | ON DELETE CASCADE | Auto-delete when property deleted |

---

## 🔌 API Reference

### Base URL

- **Development**: `http://localhost:3000/api`
- **Docker**: `http://localhost:3000/api`
- **Swagger Docs**: `http://localhost:3000/api/docs`

---

## 🧪 Testing

### Backend Testing

#### Unit Tests

```bash
# Run all tests
npm run test

# Watch mode
npm run test:watch

# Coverage report
npm run test:cov
```
---

## 🚀 Deployment

### Production Build

#### Backend

```bash
cd backend

# Build
npm run build

# Run production
NODE_ENV=production npm run start:prod
```

#### Frontend

```bash
cd frontend

# Build
npm run build

# Output in dist/
# Serve with nginx, Apache, or static host
```

### Docker Production

```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Deploy
docker-compose -f docker-compose.prod.yml up -d
```

### Environment Configuration

#### Production Backend (.env)

```env
NODE_ENV=production
DB_HOST=your-db-host
DB_PORT=5432
DB_USERNAME=secure_user
DB_PASSWORD=secure_password
DB_DATABASE=property_management_prod
PORT=3000
```

#### Production Frontend (.env)

```env
VITE_API_URL=https://api.yourdomain.com
```

---

## 🔐 Security Considerations

### Backend Security

- ✅ **Input Validation** - All DTOs validated with class-validator
- ✅ **SQL Injection Prevention** - TypeORM parameterized queries
- ✅ **Type Safety** - Full TypeScript coverage
- ✅ **Error Handling** - No sensitive data in error responses
- 🔲 **Authentication** - Ready to add (JWT, OAuth)
- 🔲 **Authorization** - Ready to add (RBAC)
- 🔲 **Rate Limiting** - Ready to add

### Frontend Security

- ✅ **XSS Prevention** - React auto-escaping
- ✅ **CSRF Protection** - Same-origin policy
- ✅ **Input Sanitization** - Validation before submission
- 🔲 **Authentication** - Ready to add (token storage)

---

## 📊 Performance Optimization

### Database

- ✅ **Indexes** - On frequently queried columns
- ✅ **Pagination** - Prevent loading large datasets
- ✅ **Query Optimization** - Efficient TypeORM queries
- ✅ **Connection Pooling** - TypeORM default configuration

### Backend

- ✅ **Caching** - Ready to add (Redis)
- ✅ **Compression** - Can be enabled
- ✅ **Rate Limiting** - Prevent abuse (configurable)

### Frontend

- ✅ **Code Splitting** - Vite automatic chunking
- ✅ **Lazy Loading** - React Query caching
- ✅ **Optimistic Updates** - Instant UI feedback
- ✅ **Memoization** - React Query cache

---

## 🔮 Future Enhancements

### Planned Features
- 🔲 User authentication (JWT)
- 🔲 Role-based access control
- 🔲 File upload for property images
- 🔲 Email notifications for due tasks
- 🔲 Dashboard with analytics
- 🔲 Property search with geocoding
- 🔲 Payment integration
- 🔲 Tenant management
- 🔲 Lease tracking
- 🔲 Reporting & analytics

### Infrastructure
- 🔲 Redis caching
- 🔲 Rate limiting
- 🔲 API versioning
- 🔲 WebSocket support (real-time updates)
- 🔲 Background job processing
- 🔲 Monitoring & observability
---

## 📄 API Error Codes

| Code | Meaning | Action |
|------|---------|--------|
| 200 | Success | Continue |
| 201 | Created | Resource created successfully |
| 204 | No Content | Delete successful |
| 400 | Bad Request | Check request validation |
| 404 | Not Found | Resource doesn't exist |
| 500 | Internal Error | Check server logs |

---

## 🎯 Best Practices

### Backend
1. ✅ Use DTOs for all endpoints
2. ✅ Validate all inputs
3. ✅ Use transactions for complex operations
4. ✅ Index frequently queried columns
5. ✅ Use migrations for schema changes
6. ✅ Write unit tests for services
7. ✅ Document with Swagger decorators

### Frontend
1. ✅ Use React Query for server state
2. ✅ Validate forms before submission
3. ✅ Show loading states
4. ✅ Handle errors gracefully
5. ✅ Use TypeScript interfaces
6. ✅ Implement pagination for lists
7. ✅ Confirm destructive actions

### Database
1. ✅ Never use `synchronize: true` in production
2. ✅ Always use migrations
3. ✅ Backup before migrations
4. ✅ Test migrations on staging
5. ✅ Use appropriate data types
6. ✅ Add indexes for performance
7. ✅ Use foreign keys for relationships

---

**For quick start instructions, see [README.md](./README.md)**

**Last Updated**: October 2024  
**Maintained by**: NOSBAAN Development Team

