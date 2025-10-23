import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Property } from '../../../databases/typeorm/entities/property.entity';
import { CreatePropertyDto } from '../dto/create-property.dto';
import { UpdatePropertyDto } from '../dto/update-property.dto';
import { PropertyStatus } from '../../../common/enums/property-status.enum';

/**
 * Core service for property management
 * Handles all property-related business logic and database operations
 */
@Injectable()
export class PropertiesService {
  constructor(
    @InjectRepository(Property)
    private propertyRepository: Repository<Property>,
  ) {}

  /**
   * Create a new property
   */
  async create(createPropertyDto: CreatePropertyDto): Promise<Property> {
    const property = this.propertyRepository.create(createPropertyDto);
    return this.propertyRepository.save(property);
  }

  /**
   * Find all properties with pagination
   */
  async findAll(options?: {
    page?: number;
    limit?: number;
  }): Promise<{
    data: Property[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const page = options?.page || 1;
    const limit = options?.limit || 10;
    const skip = (page - 1) * limit;

    const [data, total] = await this.propertyRepository.findAndCount({
      relations: ['tasks'],
      order: {
        createdAt: 'DESC',
      },
      skip,
      take: limit,
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Find all vacant properties
   */
  async findVacant(): Promise<Property[]> {
    return this.propertyRepository.find({
      where: {
        status: PropertyStatus.VACANT,
      },
      relations: ['tasks'],
      order: {
        createdAt: 'DESC',
      },
    });
  }

  /**
   * Find a property by ID
   */
  async findOne(id: string): Promise<Property> {
    const property = await this.propertyRepository.findOne({
      where: { id },
      relations: ['tasks'],
    });

    if (!property) {
      throw new NotFoundException(`Property with ID ${id} not found`);
    }

    return property;
  }

  /**
   * Update a property
   */
  async update(id: string, updatePropertyDto: UpdatePropertyDto): Promise<Property> {
    const property = await this.findOne(id);
    Object.assign(property, updatePropertyDto);
    return this.propertyRepository.save(property);
  }

  /**
   * Remove a property
   */
  async remove(id: string): Promise<void> {
    const property = await this.findOne(id);
    await this.propertyRepository.remove(property);
  }

  /**
   * Get all tasks associated with a property
   */
  async getPropertyTasks(id: string) {
    const property = await this.findOne(id);
    return property.tasks;
  }
}

