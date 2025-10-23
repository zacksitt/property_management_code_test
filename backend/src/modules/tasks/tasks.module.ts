import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TasksController } from './controllers/tasks.controller';
import { TasksService } from './services/tasks.service';
import { Task } from '../../databases/typeorm/entities/task.entity';
import { Property } from '../../databases/typeorm/entities/property.entity';

/**
 * Tasks Module
 * 
 * This module handles all task-related operations including:
 * - Task management (CRUD operations)
 * - Task filtering by status, type, and property
 * - Task-property relationships
 * 
 * Structure:
 * - controllers/   - HTTP endpoint handlers
 * - services/core/ - Core business logic
 * - services/tests/- Service unit tests
 * - dto/          - Data Transfer Objects
 * - documentation/- API documentation decorators
 */
@Module({
  imports: [TypeOrmModule.forFeature([Task, Property])],
  controllers: [TasksController],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}

