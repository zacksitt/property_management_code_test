import { DataSource } from 'typeorm';
import { PropertySeeder } from './property.seeder';
import { TaskSeeder } from './task.seeder';

/**
 * Database Seeder Runner
 * Executes all seeders in order
 */
export class DatabaseSeeder {
  constructor(private dataSource: DataSource) {}

  /**
   * Run all seeders
   */
  async run(): Promise<void> {
    console.log('🌱 Starting database seeding...\n');

    try {
      // Run seeders in order
      const propertySeeder = new PropertySeeder(this.dataSource);
      await propertySeeder.run();

      const taskSeeder = new TaskSeeder(this.dataSource);
      await taskSeeder.run();

      console.log('\n✅ Database seeding completed successfully');
    } catch (error) {
      console.error('\n❌ Error seeding database:', error);
      throw error;
    }
  }

  /**
   * Rollback all seeders
   */
  async rollback(): Promise<void> {
    console.log('🔄 Rolling back database seeds...\n');

    try {
      // Rollback in reverse order
      const taskSeeder = new TaskSeeder(this.dataSource);
      await taskSeeder.rollback();

      const propertySeeder = new PropertySeeder(this.dataSource);
      await propertySeeder.rollback();

      console.log('\n✅ Database rollback completed successfully');
    } catch (error) {
      console.error('\n❌ Error rolling back database:', error);
      throw error;
    }
  }
}

/**
 * Export individual seeders
 */
export { PropertySeeder } from './property.seeder';
export { TaskSeeder } from './task.seeder';
export { BaseSeeder } from './base.seeder';

