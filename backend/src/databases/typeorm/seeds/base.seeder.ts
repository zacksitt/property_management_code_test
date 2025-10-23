import { DataSource } from 'typeorm';

/**
 * Base Seeder Class
 * All seeders should extend this class
 */
export abstract class BaseSeeder {
  constructor(protected dataSource: DataSource) {}

  /**
   * Run the seeder
   */
  abstract run(): Promise<void>;

  /**
   * Rollback the seeder (optional)
   */
  async rollback(): Promise<void> {
    // Override this method if you need rollback functionality
  }
}

