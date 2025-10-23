import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateInitialSchema1729420000000 implements MigrationInterface {
  name = 'CreateInitialSchema1729420000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enums (with IF NOT EXISTS check)
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "property_status_enum" AS ENUM ('VACANT', 'OCCUPIED', 'MAINTENANCE');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "task_type_enum" AS ENUM ('CLEANING', 'MAINTENANCE', 'INSPECTION');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "task_status_enum" AS ENUM ('PENDING', 'IN_PROGRESS', 'DONE');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Create properties table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "properties" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "name" character varying(100) NOT NULL,
        "address" character varying(200) NOT NULL,
        "owner_name" character varying(100) NOT NULL,
        "monthly_rent" numeric(10,2) NOT NULL,
        "status" "property_status_enum" NOT NULL DEFAULT 'VACANT',
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_properties" PRIMARY KEY ("id")
      )
    `);

    // Create tasks table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "tasks" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "property_id" uuid NOT NULL,
        "description" text NOT NULL,
        "type" "task_type_enum" NOT NULL,
        "assigned_to" character varying(100) NOT NULL,
        "status" "task_status_enum" NOT NULL DEFAULT 'PENDING',
        "due_date" TIMESTAMP NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_tasks" PRIMARY KEY ("id")
      )
    `);

    // Add foreign key constraint if it doesn't exist
    await queryRunner.query(`
      DO $$ BEGIN
        ALTER TABLE "tasks" ADD CONSTRAINT "FK_tasks_property" 
          FOREIGN KEY ("property_id") REFERENCES "properties"("id") 
          ON DELETE CASCADE ON UPDATE NO ACTION;
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Create indexes (with IF NOT EXISTS)
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_properties_status" ON "properties" ("status")
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_tasks_property_id" ON "tasks" ("property_id")
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_tasks_status" ON "tasks" ("status")
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_tasks_type" ON "tasks" ("type")
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_tasks_due_date" ON "tasks" ("due_date")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX "IDX_tasks_due_date"`);
    await queryRunner.query(`DROP INDEX "IDX_tasks_type"`);
    await queryRunner.query(`DROP INDEX "IDX_tasks_status"`);
    await queryRunner.query(`DROP INDEX "IDX_tasks_property_id"`);
    await queryRunner.query(`DROP INDEX "IDX_properties_status"`);

    // Drop tables
    await queryRunner.query(`DROP TABLE "tasks"`);
    await queryRunner.query(`DROP TABLE "properties"`);

    // Drop enums
    await queryRunner.query(`DROP TYPE "task_status_enum"`);
    await queryRunner.query(`DROP TYPE "task_type_enum"`);
    await queryRunner.query(`DROP TYPE "property_status_enum"`);
  }
}

