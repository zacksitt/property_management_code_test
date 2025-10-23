import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { TaskType } from '../../../common/enums/task-type.enum';
import { TaskStatus } from '../../../common/enums/task-status.enum';

/**
 * Swagger documentation decorator for creating a task
 */
export function ApiCreateTask() {
  return applyDecorators(
    ApiOperation({ summary: 'Create a new task' }),
    ApiResponse({ status: 201, description: 'Task created successfully' }),
  );
}

/**
 * Swagger documentation decorator for getting all tasks with filters and pagination
 */
export function ApiFindAllTasks() {
  return applyDecorators(
    ApiOperation({ summary: 'Get all tasks with optional filters and pagination' }),
    ApiQuery({ name: 'status', enum: TaskStatus, required: false }),
    ApiQuery({ name: 'type', enum: TaskType, required: false }),
    ApiQuery({ name: 'propertyId', type: String, required: false }),
    ApiQuery({
      name: 'page',
      type: Number,
      required: false,
      description: 'Page number (default: 1)',
    }),
    ApiQuery({
      name: 'limit',
      type: Number,
      required: false,
      description: 'Items per page (default: 10)',
    }),
    ApiResponse({ status: 200, description: 'Paginated list of tasks' }),
  );
}

/**
 * Swagger documentation decorator for getting a task by ID
 */
export function ApiFindOneTask() {
  return applyDecorators(
    ApiOperation({ summary: 'Get a task by ID' }),
    ApiResponse({ status: 200, description: 'Task found' }),
    ApiResponse({ status: 404, description: 'Task not found' }),
  );
}

/**
 * Swagger documentation decorator for updating a task
 */
export function ApiUpdateTask() {
  return applyDecorators(
    ApiOperation({ summary: 'Update a task' }),
    ApiResponse({ status: 200, description: 'Task updated successfully' }),
    ApiResponse({ status: 404, description: 'Task not found' }),
  );
}

/**
 * Swagger documentation decorator for deleting a task
 */
export function ApiDeleteTask() {
  return applyDecorators(
    ApiOperation({ summary: 'Delete a task' }),
    ApiResponse({ status: 204, description: 'Task deleted successfully' }),
    ApiResponse({ status: 404, description: 'Task not found' }),
  );
}

