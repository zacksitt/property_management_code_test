# Database Module

Centralized database configuration and management for the Property Management Application.

## 📁 Directory Structure

```
database/
├── typeorm/              # TypeORM configuration
│   ├── entities/        # TypeORM entities
│   │   ├── property.entity.ts
│   │   ├── task.entity.ts
│   │   └── index.ts
│   ├── migrations/      # Database migrations
│   │   └── .gitkeep
│   └── typeorm.config.ts
│
├── seeds/                # Database seeders
│   ├── base.seeder.ts
│   ├── property.seeder.ts
│   ├── task.seeder.ts
│   └── index.ts
│
├── scripts/              # CLI scripts
│   ├── seed.ts          # Run seeders
│   └── migration.ts     # Run migrations
│
├── database.module.ts    # NestJS database module
└── README.md            # This file
```

## 🎯 Purpose

The database module centralizes all database-related code:
- **Entities** - TypeORM entity definitions
- **Migrations** - Database schema migrations
- **Seeds** - Sample data for development/testing
- **Configuration** - TypeORM setup

## 🚀 Quick Start

### 1. Environment Configuration

Create a `.env` file with database credentials:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=property_management
NODE_ENV=development
```

### 2. Add to package.json

Add these scripts to your `package.json`:

```json
{
  "scripts": {
    "seed": "ts-node src/database/scripts/seed.ts",
    "seed:rollback": "ts-node src/database/scripts/seed.ts rollback",
    "migration:generate": "typeorm-ts-node-commonjs migration:generate -d src/database/typeorm/typeorm.config.ts",
    "migration:run": "ts-node src/database/scripts/migration.ts run",
    "migration:revert": "ts-node src/database/scripts/migration.ts revert",
    "migration:show": "ts-node src/database/scripts/migration.ts show"
  }
}
```

### 3. Import Database Module

In your `app.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    // ... other modules
  ],
})
export class AppModule {}
```

## 📊 Entities

### Importing Entities

```typescript
// Recommended: Import from index
import { Property, Task } from '../database/typeorm/entities';

// Or import directly
import { Property } from '../database/typeorm/entities/property.entity';
import { Task } from '../database/typeorm/entities/task.entity';
```

### Creating New Entities

1. Create entity file in `typeorm/entities/` directory:

```typescript
// typeorm/entities/new-entity.entity.ts
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('table_name')
export class NewEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;
}
```

2. Export from `typeorm/entities/index.ts`:

```typescript
export { NewEntity } from './new-entity.entity';

export const entities = [
  Property,
  Task,
  NewEntity, // Add here
];
```

## 🔄 Migrations

### Generate Migration

```bash
# After changing entities, generate a migration
npm run migration:generate -- src/database/typeorm/migrations/MigrationName
```

### Run Migrations

```bash
# Run pending migrations
npm run migration:run

# Revert last migration
npm run migration:revert

# Show migration status
npm run migration:show
```

### Migration Best Practices

1. **Always generate migrations** after entity changes
2. **Test migrations** before deploying to production
3. **Never modify** existing migrations
4. **Use descriptive names** for migrations
5. **Review generated SQL** before running

## 🌱 Seeding

### Run Seeds

```bash
# Seed the database
npm run seed

# Rollback seeds
npm run seed:rollback
```

### Creating New Seeders

1. Create seeder file:

```typescript
// seeds/new-entity.seeder.ts
import { DataSource } from 'typeorm';
import { BaseSeeder } from './base.seeder';
import { NewEntity } from '../entities/new-entity.entity';

export class NewEntitySeeder extends BaseSeeder {
  async run(): Promise<void> {
    const repository = this.dataSource.getRepository(NewEntity);

    const data = [
      { name: 'Sample 1' },
      { name: 'Sample 2' },
    ];

    await repository.save(data);
    console.log(`✅ Seeded ${data.length} records`);
  }

  async rollback(): Promise<void> {
    const repository = this.dataSource.getRepository(NewEntity);
    await repository.clear();
    console.log('✅ Rolled back seeds');
  }
}
```

2. Add to `seeds/index.ts`:

```typescript
import { NewEntitySeeder } from './new-entity.seeder';

export class DatabaseSeeder {
  async run(): Promise<void> {
    // ... existing seeders

    const newEntitySeeder = new NewEntitySeeder(this.dataSource);
    await newEntitySeeder.run();
  }
}
```

### Seeder Best Practices

1. **Check if data exists** before seeding
2. **Use transactions** for complex seeds
3. **Implement rollback** for cleanup
4. **Seed in correct order** (respect foreign keys)
5. **Use realistic data** for testing

## 📝 Database Module Usage

### In Feature Modules

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Property } from '../../database/typeorm/entities/property.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Property])],
  // ...
})
export class PropertiesModule {}
```

### In Services

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Property } from '../../database/typeorm/entities/property.entity';

@Injectable()
export class PropertiesService {
  constructor(
    @InjectRepository(Property)
    private propertyRepository: Repository<Property>,
  ) {}

  async findAll(): Promise<Property[]> {
    return this.propertyRepository.find();
  }
}
```

## 🔧 TypeORM Configuration

### Configuration File

Located at `typeorm/typeorm.config.ts`:

```typescript
export const typeOrmConfig: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'property_management',
  entities: [join(__dirname, '../entities/**/*.entity{.ts,.js}')],
  migrations: [join(__dirname, './migrations/**/*{.ts,.js}')],
  synchronize: process.env.NODE_ENV !== 'production',
  logging: process.env.NODE_ENV === 'development',
};
```

### Environment-Specific Configuration

```env
# Development
NODE_ENV=development
synchronize=true  # Auto-sync schema (use migrations in production)
logging=true      # Enable query logging

# Production
NODE_ENV=production
synchronize=false # ALWAYS false in production
logging=false     # Disable for performance
```

## 🧪 Testing

### Test with In-Memory Database

For unit tests, use an in-memory database:

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Property } from '../database/entities/property.entity';

describe('PropertiesService', () => {
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [Property],
          synchronize: true,
        }),
        TypeOrmModule.forFeature([Property]),
      ],
      providers: [PropertiesService],
    }).compile();
  });
});
```

## 🔍 Common Tasks

### Add Index to Column

```typescript
@Entity('properties')
@Index(['status'])  // Single column index
@Index(['status', 'createdAt']) // Composite index
export class Property {
  @Column()
  status: string;
}
```

### Add Foreign Key Relationship

```typescript
// Many-to-One
@ManyToOne(() => Property, property => property.tasks)
@JoinColumn({ name: 'property_id' })
property: Property;

// One-to-Many
@OneToMany(() => Task, task => task.property)
tasks: Task[];
```

### Add Custom Query

```typescript
async findByStatus(status: string): Promise<Property[]> {
  return this.propertyRepository
    .createQueryBuilder('property')
    .where('property.status = :status', { status })
    .getMany();
}
```

## 📚 Resources

- [TypeORM Documentation](https://typeorm.io/)
- [NestJS Database](https://docs.nestjs.com/techniques/database)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

## ⚠️ Important Notes

1. **Never use `synchronize: true` in production**
2. **Always backup database before migrations**
3. **Test migrations on staging first**
4. **Keep entities in sync with database**
5. **Use migrations for schema changes**
6. **Seed data is for development only**

## 🐛 Troubleshooting

### Connection Issues

```bash
# Check PostgreSQL is running
pg_isready

# Test connection
psql -h localhost -U postgres -d property_management
```

### Migration Issues

```bash
# Clear compiled files
rm -rf dist/

# Rebuild
npm run build

# Try migration again
npm run migration:run
```

### Seeding Issues

```bash
# Check database connection
npm run seed:rollback
npm run seed
```

## 📝 Summary

- ✅ Centralized database configuration
- ✅ TypeORM entities with proper indexing
- ✅ Migration system for schema changes
- ✅ Seeder system for sample data
- ✅ CLI scripts for database operations
- ✅ Environment-based configuration
- ✅ Production-ready setup

---

For more information, see the [Module Structure Guide](../modules/MODULE_STRUCTURE.md)

