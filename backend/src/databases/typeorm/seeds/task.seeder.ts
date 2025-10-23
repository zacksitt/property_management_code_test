import { DataSource } from 'typeorm';
import { BaseSeeder } from './base.seeder';
import { Task } from '../entities/task.entity';
import { Property } from '../entities/property.entity';
import { TaskType } from '../../../common/enums/task-type.enum';
import { TaskStatus } from '../../../common/enums/task-status.enum';

/**
 * Task Seeder
 * Seeds the database with sample tasks
 */
export class TaskSeeder extends BaseSeeder {
  constructor(dataSource: DataSource) {
    super(dataSource);
  }

  async run(): Promise<void> {
    const taskRepository = this.dataSource.getRepository(Task);
    const propertyRepository = this.dataSource.getRepository(Property);

    // Check if tasks already exist
    const count = await taskRepository.count();
    if (count > 0) {
      console.log('Tasks already seeded. Skipping...');
      return;
    }

    // Get all properties
    const properties = await propertyRepository.find();
    if (properties.length === 0) {
      console.log('⚠️  No properties found. Please seed properties first.');
      return;
    }

    const tasks = [
      {
        propertyId: properties[0].id,
        description: 'Deep clean all rooms and common areas',
        type: TaskType.CLEANING,
        assignedTo: 'Maria Garcia',
        status: TaskStatus.PENDING,
        dueDate: new Date('2024-12-15'),
      },
      {
        propertyId: properties[0].id,
        description: 'Fix leaking faucet in master bathroom',
        type: TaskType.MAINTENANCE,
        assignedTo: 'Mike Johnson',
        status: TaskStatus.IN_PROGRESS,
        dueDate: new Date('2024-12-10'),
      },
      {
        propertyId: properties[1].id,
        description: 'Annual safety inspection',
        type: TaskType.INSPECTION,
        assignedTo: 'Sarah Williams',
        status: TaskStatus.PENDING,
        dueDate: new Date('2024-12-20'),
      },
      {
        propertyId: properties[1].id,
        description: 'Clean windows and balcony',
        type: TaskType.CLEANING,
        assignedTo: 'Maria Garcia',
        status: TaskStatus.DONE,
        dueDate: new Date('2024-12-05'),
      },
      {
        propertyId: properties[2].id,
        description: 'Replace broken HVAC system',
        type: TaskType.MAINTENANCE,
        assignedTo: 'Mike Johnson',
        status: TaskStatus.IN_PROGRESS,
        dueDate: new Date('2024-12-18'),
      },
      {
        propertyId: properties[3].id,
        description: 'Quarterly property inspection',
        type: TaskType.INSPECTION,
        assignedTo: 'Sarah Williams',
        status: TaskStatus.DONE,
        dueDate: new Date('2024-12-01'),
      },
      {
        propertyId: properties[4].id,
        description: 'Paint exterior walls',
        type: TaskType.MAINTENANCE,
        assignedTo: 'Mike Johnson',
        status: TaskStatus.PENDING,
        dueDate: new Date('2024-12-25'),
      },
      {
        propertyId: properties[4].id,
        description: 'Deep clean before new tenant move-in',
        type: TaskType.CLEANING,
        assignedTo: 'Maria Garcia',
        status: TaskStatus.PENDING,
        dueDate: new Date('2024-12-22'),
      },
    ];

    await taskRepository.save(tasks);

    console.log(`✅ Seeded ${tasks.length} tasks successfully`);
  }

  async rollback(): Promise<void> {
    const taskRepository = this.dataSource.getRepository(Task);
    await taskRepository.clear();
    console.log('✅ Rolled back task seeds');
  }
}

