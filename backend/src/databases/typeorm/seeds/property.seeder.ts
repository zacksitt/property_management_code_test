import { DataSource } from 'typeorm';
import { BaseSeeder } from './base.seeder';
import { Property } from '../entities/property.entity';
import { PropertyStatus } from '../../../common/enums/property-status.enum';

/**
 * Property Seeder
 * Seeds the database with sample properties
 */
export class PropertySeeder extends BaseSeeder {
  constructor(dataSource: DataSource) {
    super(dataSource);
  }

  async run(): Promise<void> {
    const propertyRepository = this.dataSource.getRepository(Property);

    // Check if properties already exist
    const count = await propertyRepository.count();
    if (count > 0) {
      console.log('Properties already seeded. Skipping...');
      return;
    }

    const properties = [
      {
        name: 'Sunset Apartments',
        address: '123 Main Street, San Francisco, CA 94102',
        ownerName: 'John Smith',
        monthlyRent: 2500.00,
        status: PropertyStatus.OCCUPIED,
      },
      {
        name: 'Ocean View Villa',
        address: '456 Beach Boulevard, Santa Monica, CA 90401',
        ownerName: 'Jane Doe',
        monthlyRent: 3500.00,
        status: PropertyStatus.VACANT,
      },
      {
        name: 'Mountain Lodge',
        address: '789 Peak Drive, Denver, CO 80202',
        ownerName: 'Bob Johnson',
        monthlyRent: 2000.00,
        status: PropertyStatus.MAINTENANCE,
      },
      {
        name: 'Downtown Loft',
        address: '321 City Center, New York, NY 10001',
        ownerName: 'Alice Williams',
        monthlyRent: 4000.00,
        status: PropertyStatus.OCCUPIED,
      },
      {
        name: 'Garden Cottage',
        address: '654 Green Lane, Portland, OR 97201',
        ownerName: 'Charlie Brown',
        monthlyRent: 1800.00,
        status: PropertyStatus.VACANT,
      },
    ];

    await propertyRepository.save(properties);

    console.log(`✅ Seeded ${properties.length} properties successfully`);
  }

  async rollback(): Promise<void> {
    const propertyRepository = this.dataSource.getRepository(Property);
    await propertyRepository.clear();
    console.log('✅ Rolled back property seeds');
  }
}

