import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';

/**
 * Swagger documentation decorator for creating a property
 */
export function ApiCreateProperty() {
  return applyDecorators(
    ApiOperation({ summary: 'Create a new property' }),
    ApiResponse({ status: 201, description: 'Property created successfully' }),
  );
}

/**
 * Swagger documentation decorator for getting all properties with pagination
 */
export function ApiFindAllProperties() {
  return applyDecorators(
    ApiOperation({ summary: 'Get all properties with pagination' }),
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
    ApiResponse({ status: 200, description: 'Paginated list of properties' }),
  );
}

/**
 * Swagger documentation decorator for getting vacant properties
 */
export function ApiFindVacantProperties() {
  return applyDecorators(
    ApiOperation({ summary: 'Get all vacant properties' }),
    ApiResponse({ status: 200, description: 'List of vacant properties' }),
  );
}

/**
 * Swagger documentation decorator for getting a property by ID
 */
export function ApiFindOneProperty() {
  return applyDecorators(
    ApiOperation({ summary: 'Get a property by ID' }),
    ApiResponse({ status: 200, description: 'Property found' }),
    ApiResponse({ status: 404, description: 'Property not found' }),
  );
}

/**
 * Swagger documentation decorator for updating a property
 */
export function ApiUpdateProperty() {
  return applyDecorators(
    ApiOperation({ summary: 'Update a property' }),
    ApiResponse({ status: 200, description: 'Property updated successfully' }),
    ApiResponse({ status: 404, description: 'Property not found' }),
  );
}

/**
 * Swagger documentation decorator for deleting a property
 */
export function ApiDeleteProperty() {
  return applyDecorators(
    ApiOperation({ summary: 'Delete a property' }),
    ApiResponse({ status: 204, description: 'Property deleted successfully' }),
    ApiResponse({ status: 404, description: 'Property not found' }),
  );
}

/**
 * Swagger documentation decorator for getting property tasks
 */
export function ApiGetPropertyTasks() {
  return applyDecorators(
    ApiOperation({ summary: 'Get all tasks for a property' }),
    ApiResponse({ status: 200, description: 'List of tasks for the property' }),
    ApiResponse({ status: 404, description: 'Property not found' }),
  );
}

