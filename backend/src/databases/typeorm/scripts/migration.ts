#!/usr/bin/env ts-node

/**
 * Database Migration CLI Script
 * 
 * Usage:
 *   npm run migration:generate -- MigrationName
 *   npm run migration:run
 *   npm run migration:revert
 */

import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import dataSource from '../typeorm.config';

// Load environment variables
config();

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  try {
    await dataSource.initialize();
    console.log('✅ Database connection established');

    switch (command) {
      case 'run':
        console.log('🚀 Running migrations...');
        await dataSource.runMigrations();
        console.log('✅ Migrations completed successfully');
        break;

      case 'revert':
        console.log('⏪ Reverting last migration...');
        await dataSource.undoLastMigration();
        console.log('✅ Migration reverted successfully');
        break;

      case 'show':
        console.log('📋 Showing migrations...');
        const migrations = await dataSource.showMigrations();
        console.log('Pending migrations:', migrations);
        break;

      default:
        console.log('ℹ️  Available commands:');
        console.log('  run    - Run pending migrations');
        console.log('  revert - Revert last migration');
        console.log('  show   - Show migration status');
    }

    await dataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    await dataSource.destroy();
    process.exit(1);
  }
}

main();

