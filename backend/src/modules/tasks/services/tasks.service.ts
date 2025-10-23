import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from '../../../databases/typeorm/entities/task.entity';
import { Property } from '../../../databases/typeorm/entities/property.entity';
import { CreateTaskDto } from '../dto/create-task.dto';
import { UpdateTaskDto } from '../dto/update-task.dto';
import { TaskType } from '../../../common/enums/task-type.enum';
import { TaskStatus } from '../../../common/enums/task-status.enum';

/**
 * Core service for task management
 * Handles all task-related business logic and database operations
 */
@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
    @InjectRepository(Property)
    private propertyRepository: Repository<Property>,
  ) {}

  /**
   * Create a new task
   */
  async create(createTaskDto: CreateTaskDto): Promise<Task> {
    // Verify property exists
    const property = await this.propertyRepository.findOne({
      where: { id: createTaskDto.propertyId },
    });

    if (!property) {
      throw new NotFoundException(
        `Property with ID ${createTaskDto.propertyId} not found`,
      );
    }

    const task = this.taskRepository.create({
      ...createTaskDto,
      dueDate: new Date(createTaskDto.dueDate),
    });

    return this.taskRepository.save(task);
  }

  /**
   * Find all tasks with optional filters and pagination
   */
  async findAll(filters?: {
    status?: TaskStatus;
    type?: TaskType;
    propertyId?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    data: Task[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const skip = (page - 1) * limit;

    const query = this.taskRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.property', 'property')
      .orderBy('task.dueDate', 'ASC');

    if (filters?.status) {
      query.andWhere('task.status = :status', { status: filters.status });
    }

    if (filters?.type) {
      query.andWhere('task.type = :type', { type: filters.type });
    }

    if (filters?.propertyId) {
      query.andWhere('task.propertyId = :propertyId', {
        propertyId: filters.propertyId,
      });
    }

    // Get total count before pagination
    const total = await query.getCount();

    // Apply pagination
    query.skip(skip).take(limit);

    const data = await query.getMany();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Find a task by ID
   */
  async findOne(id: string): Promise<Task> {
    const task = await this.taskRepository.findOne({
      where: { id },
      relations: ['property'],
    });

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    return task;
  }

  /**
   * Update a task
   */
  async update(id: string, updateTaskDto: UpdateTaskDto): Promise<Task> {
    const task = await this.findOne(id);

    Object.assign(task, {
      ...updateTaskDto,
      ...(updateTaskDto.dueDate && { dueDate: new Date(updateTaskDto.dueDate) }),
    });

    return this.taskRepository.save(task);
  }

  /**
   * Remove a task
   */
  async remove(id: string): Promise<void> {
    const task = await this.findOne(id);
    await this.taskRepository.remove(task);
  }
}

