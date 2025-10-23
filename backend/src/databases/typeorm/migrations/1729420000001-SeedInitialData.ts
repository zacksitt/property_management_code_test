import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedInitialData1729420000001 implements MigrationInterface {
  name = 'SeedInitialData1729420000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Insert sample properties
    await queryRunner.query(`
      INSERT INTO "properties" ("id", "name", "address", "owner_name", "monthly_rent", "status", "created_at", "updated_at")
      VALUES
        (gen_random_uuid(), 'Sunset Villa', '123 Ocean Drive, Miami, FL', 'John Smith', 2500.00, 'OCCUPIED', NOW(), NOW()),
        (gen_random_uuid(), 'Downtown Loft', '456 Main Street, New York, NY', 'Sarah Johnson', 3200.00, 'VACANT', NOW(), NOW()),
        (gen_random_uuid(), 'Garden Apartment', '789 Park Avenue, Seattle, WA', 'Michael Brown', 1800.00, 'OCCUPIED', NOW(), NOW()),
        (gen_random_uuid(), 'Mountain View House', '321 Hill Road, Denver, CO', 'Emily Davis', 2200.00, 'MAINTENANCE', NOW(), NOW()),
        (gen_random_uuid(), 'Beach Cottage', '654 Shore Lane, Los Angeles, CA', 'David Wilson', 2800.00, 'VACANT', NOW(), NOW())
    `);

    // Get property IDs for task insertion
    const properties = await queryRunner.query(`SELECT id FROM "properties" LIMIT 5`);

    if (properties.length >= 5) {
      // Insert sample tasks
      await queryRunner.query(`
        INSERT INTO "tasks" ("id", "property_id", "description", "type", "assigned_to", "status", "due_date", "created_at", "updated_at")
        VALUES
          (gen_random_uuid(), $1, 'Deep clean all rooms and replace air filters', 'CLEANING', 'Jane Cleaning Service', 'PENDING', NOW() + interval '5 days', NOW(), NOW()),
          (gen_random_uuid(), $1, 'Inspect HVAC system and test all vents', 'INSPECTION', 'Mike Inspector', 'PENDING', NOW() + interval '10 days', NOW(), NOW()),
          (gen_random_uuid(), $2, 'Fix leaking kitchen faucet', 'MAINTENANCE', 'Bob Plumber', 'IN_PROGRESS', NOW() + interval '2 days', NOW(), NOW()),
          (gen_random_uuid(), $2, 'Clean carpets and windows', 'CLEANING', 'Jane Cleaning Service', 'PENDING', NOW() + interval '7 days', NOW(), NOW()),
          (gen_random_uuid(), $3, 'Repair broken AC unit', 'MAINTENANCE', 'Tom HVAC Tech', 'DONE', NOW() - interval '3 days', NOW(), NOW()),
          (gen_random_uuid(), $4, 'Monthly property inspection', 'INSPECTION', 'Mike Inspector', 'IN_PROGRESS', NOW() + interval '1 day', NOW(), NOW()),
          (gen_random_uuid(), $4, 'Replace damaged roof tiles', 'MAINTENANCE', 'Roof Repair Co.', 'PENDING', NOW() + interval '15 days', NOW(), NOW()),
          (gen_random_uuid(), $5, 'Pre-rental deep cleaning', 'CLEANING', 'Jane Cleaning Service', 'PENDING', NOW() + interval '3 days', NOW(), NOW())
      `, [properties[0].id, properties[1].id, properties[2].id, properties[3].id, properties[4].id]);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove all tasks and properties
    await queryRunner.query(`DELETE FROM "tasks"`);
    await queryRunner.query(`DELETE FROM "properties"`);
  }
}

