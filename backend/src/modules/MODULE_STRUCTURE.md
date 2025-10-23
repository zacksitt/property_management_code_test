# Module Structure Guidelines

This document explains the improved module structure for better organization and maintainability.

## 📁 New Module Structure

Each module follows this standardized structure:

```
module-name/
├── controllers/                    # HTTP layer
│   └── module-name.controller.ts  # Handles HTTP requests/responses
│
├── services/                       # Business logic layer
│   ├── core/                      # Core business logic services
│   │   └── module-name.service.ts # Main service implementation
│   ├── services/                  # Helper/utility services (optional)
│   │   └── helper.service.ts     # Additional services
│   └── tests/                     # Service tests
│       └── module-name.service.spec.ts
│
├── dto/                           # Data Transfer Objects
│   ├── create-module.dto.ts
│   └── update-module.dto.ts
│
├── documentation/                  # API documentation
│   └── module-name.decorators.ts  # Swagger decorators
│
└── module-name.module.ts          # NestJS module definition
```

## 🎯 Design Principles

### 1. **Separation of Concerns**

#### Controllers (`controllers/`)
- **Purpose**: Handle HTTP requests and responses
- **Responsibilities**:
  - Route handling
  - Request validation
  - Response formatting
  - HTTP status codes
- **Should NOT**: Contain business logic

#### Core Services (`services/core/`)
- **Purpose**: Core business logic
- **Responsibilities**:
  - Business rules implementation
  - Data validation
  - Database operations
  - Complex computations
- **Naming**: Always named after the module (e.g., `properties.service.ts`)

#### Helper Services (`services/services/`)
- **Purpose**: Utility and helper functions
- **Responsibilities**:
  - Reusable functionality
  - Third-party integrations
  - Data transformations
  - Calculations
- **Example**: `property-calculation.service.ts`, `property-validator.service.ts`

#### Tests (`services/tests/`)
- **Purpose**: Unit and integration tests
- **Responsibilities**:
  - Test core business logic
  - Mock dependencies
  - Ensure code quality
- **Naming**: `*.spec.ts` or `*.test.ts`

### 2. **Clear Dependency Flow**

```
HTTP Request
    ↓
Controller (controllers/)
    ↓
Core Service (services/core/)
    ↓
[Helper Services] (services/services/) [Optional]
    ↓
Database / External APIs
    ↓
Response
```

## 📝 Example Implementation

### Properties Module

```
properties/
├── controllers/
│   └── properties.controller.ts
│       - Handles: GET /properties, POST /properties, etc.
│       - Injects: PropertiesService
│
├── services/
│   ├── core/
│   │   └── properties.service.ts
│   │       - Handles: CRUD operations, business logic
│   │       - Injects: TypeORM Repository
│   │
│   ├── services/                     [Future expansion]
│   │   ├── property-calculator.service.ts
│   │   │   - Calculates rent, occupancy rates, etc.
│   │   └── property-validator.service.ts
│   │       - Validates property data, checks duplicates
│   │
│   └── tests/
│       └── properties.service.spec.ts
│           - Tests all service methods
│
├── dto/
│   ├── create-property.dto.ts
│   └── update-property.dto.ts
│
├── documentation/
│   └── properties.decorators.ts
│
└── properties.module.ts
```

## 🔧 Creating a New Module

### Step 1: Create Directory Structure

```bash
mkdir -p src/modules/your-module/controllers
mkdir -p src/modules/your-module/services/core
mkdir -p src/modules/your-module/services/services
mkdir -p src/modules/your-module/services/tests
mkdir -p src/modules/your-module/dto
mkdir -p src/modules/your-module/documentation
```

### Step 2: Create Controller

```typescript
// controllers/your-module.controller.ts
import { Controller, Get } from '@nestjs/common';
import { YourModuleService } from '../services/core/your-module.service';

@Controller('your-module')
export class YourModuleController {
  constructor(
    private readonly yourModuleService: YourModuleService,
  ) {}

  @Get()
  findAll() {
    return this.yourModuleService.findAll();
  }
}
```

### Step 3: Create Core Service

```typescript
// services/core/your-module.service.ts
import { Injectable } from '@nestjs/common';

@Injectable()
export class YourModuleService {
  findAll() {
    // Business logic here
    return [];
  }
}
```

### Step 4: Create Test File

```typescript
// services/tests/your-module.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { YourModuleService } from '../core/your-module.service';

describe('YourModuleService', () => {
  let service: YourModuleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [YourModuleService],
    }).compile();

    service = module.get<YourModuleService>(YourModuleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
```

### Step 5: Create Module

```typescript
// your-module.module.ts
import { Module } from '@nestjs/common';
import { YourModuleController } from './controllers/your-module.controller';
import { YourModuleService } from './services/core/your-module.service';

@Module({
  controllers: [YourModuleController],
  providers: [YourModuleService],
  exports: [YourModuleService],
})
export class YourModuleModule {}
```

## 🧪 Testing Strategy

### Unit Tests (`services/tests/`)
- Test each service method in isolation
- Mock all dependencies
- Test edge cases and error scenarios

```typescript
describe('PropertiesService', () => {
  it('should create a property', async () => {
    const result = await service.create(mockDto);
    expect(result).toBeDefined();
  });

  it('should throw error for invalid data', async () => {
    await expect(service.create(invalidDto))
      .rejects
      .toThrow();
  });
});
```

### Integration Tests
- Test controller + service integration
- Use real dependencies when possible
- Test HTTP layer

## 📊 Benefits of This Structure

### ✅ Advantages

1. **Clear Separation**
   - Controllers handle HTTP only
   - Services handle business logic
   - Tests are organized

2. **Scalability**
   - Easy to add helper services
   - Services can be reused across modules
   - Clear where to add new functionality

3. **Testability**
   - Services are easy to unit test
   - Controllers can be tested separately
   - Mocking is straightforward

4. **Maintainability**
   - Find files quickly
   - Understand structure at a glance
   - Consistent across all modules

5. **Team Collaboration**
   - Team members know where to look
   - Easy to review code
   - Clear ownership of concerns

## 🔍 Finding Code

### "Where do I add...?"

| What to Add | Where | Example |
|------------|-------|---------|
| New endpoint | `controllers/` | `@Get()`, `@Post()` |
| Business logic | `services/core/` | Validation, calculations |
| Helper function | `services/services/` | Reusable utilities |
| API documentation | `documentation/` | Swagger decorators |
| Data validation | `dto/` | Class validators |
| Unit tests | `services/tests/` | Service tests |

## 📚 Real-World Examples

### Example 1: Adding a Helper Service

```typescript
// services/services/property-calculator.service.ts
@Injectable()
export class PropertyCalculatorService {
  calculateOccupancyRate(
    totalUnits: number,
    occupiedUnits: number,
  ): number {
    return (occupiedUnits / totalUnits) * 100;
  }

  calculateTotalRevenue(properties: Property[]): number {
    return properties.reduce(
      (sum, p) => sum + p.monthlyRent,
      0,
    );
  }
}
```

```typescript
// services/core/properties.service.ts
@Injectable()
export class PropertiesService {
  constructor(
    private readonly calculator: PropertyCalculatorService,
  ) {}

  async getStatistics() {
    const properties = await this.findAll();
    const revenue = this.calculator.calculateTotalRevenue(
      properties.data,
    );
    return { revenue };
  }
}
```

### Example 2: Multiple Test Files

```
services/tests/
├── properties.service.spec.ts         # Core service tests
├── property-calculator.service.spec.ts # Calculator tests
└── property-validator.service.spec.ts  # Validator tests
```

## 🚀 Migration from Old Structure

If you have modules in the old flat structure:

```bash
# Old structure
properties/
├── properties.controller.ts
├── properties.service.ts
└── properties.module.ts
```

Migrate to new structure:

```bash
# 1. Create new directories
mkdir -p properties/controllers
mkdir -p properties/services/core
mkdir -p properties/services/tests

# 2. Move files
mv properties/properties.controller.ts properties/controllers/
mv properties/properties.service.ts properties/services/core/

# 3. Update imports in properties.module.ts
# 4. Create test file in services/tests/
# 5. Delete old files if everything works
```

## ✨ Best Practices

1. **Keep controllers thin** - Only HTTP handling
2. **Keep services focused** - Single responsibility
3. **Write tests** - Test core business logic
4. **Document complexity** - Add comments for complex logic
5. **Use TypeScript** - Leverage type safety
6. **Export services** - Make them reusable
7. **Inject dependencies** - Use dependency injection

## 🎓 Summary

- **controllers/** → HTTP layer
- **services/core/** → Business logic
- **services/services/** → Helpers (optional)
- **services/tests/** → Unit tests
- **dto/** → Data Transfer Objects
- **documentation/** → API docs

This structure promotes:
- ✅ Clean code
- ✅ Easy testing
- ✅ Scalability
- ✅ Team collaboration
- ✅ Maintainability

