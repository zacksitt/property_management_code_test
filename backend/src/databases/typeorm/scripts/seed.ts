#!/usr/bin/env ts-node

/**
 * Database Seeder CLI Script
 * 
 * Usage:
 *   npm run seed         - Run all seeders
 *   npm run seed:rollback - Rollback all seeds
 */

import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { DatabaseSeeder } from '../seeds';
import dataSource from '../typeorm.config';

// Load environment variables
config();

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  try {
    // Initialize database connection
    console.log('📡 Connecting to database...');
    await dataSource.initialize();
    console.log('✅ Database connection established\n');

    const seeder = new DatabaseSeeder(dataSource);

    if (command === 'rollback') {
      await seeder.rollback();
    } else {
      await seeder.run();
    }

    await dataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('❌ Fatal error:', error);
    await dataSource.destroy();
    process.exit(1);
  }
}

main();

