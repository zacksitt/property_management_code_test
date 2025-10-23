import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PropertiesController } from './controllers/properties.controller';
import { PropertiesService } from './services/properties.service';
import { Property } from '../../databases/typeorm/entities/property.entity';

/**
 * Properties Module
 * 
 * This module handles all property-related operations including:
 * - Property management (CRUD operations)
 * - Property search and filtering
 * - Property-task relationships
 * 
 * Structure:
 * - controllers/   - HTTP endpoint handlers
 * - services/core/ - Core business logic
 * - services/tests/- Service unit tests
 * - dto/          - Data Transfer Objects
 * - documentation/- API documentation decorators
 */
@Module({
  imports: [TypeOrmModule.forFeature([Property])],
  controllers: [PropertiesController],
  providers: [PropertiesService],
  exports: [PropertiesService],
})
export class PropertiesModule {}

