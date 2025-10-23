/**
 * Entity exports
 * Centralized export file for all database entities
 */
import { Property } from './property.entity';
import { Task } from './task.entity';

export { Property, Task };

/**
 * Array of all entities for TypeORM configuration
 */
export const entities = [
  Property,
  Task,
];

