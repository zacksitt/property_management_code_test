import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { PropertiesService } from '../properties.service';
import { Property } from '../../../../databases/typeorm/entities/property.entity';
import { PropertyStatus } from '../../../../common/enums/property-status.enum';

describe('PropertiesService', () => {
  let service: PropertiesService;
  let repository: Repository<Property>;

  const mockProperty = {
    id: '1',
    name: 'Test Property',
    address: '123 Test St',
    ownerName: 'John Doe',
    monthlyRent: 1000,
    status: PropertyStatus.VACANT,
    tasks: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPropertyRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    findAndCount: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PropertiesService,
        {
          provide: getRepositoryToken(Property),
          useValue: mockPropertyRepository,
        },
      ],
    }).compile();

    service = module.get<PropertiesService>(PropertiesService);
    repository = module.get<Repository<Property>>(getRepositoryToken(Property));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new property', async () => {
      const createPropertyDto = {
        name: 'Test Property',
        address: '123 Test St',
        ownerName: 'John Doe',
        monthlyRent: 1000,
        status: PropertyStatus.VACANT,
      };

      mockPropertyRepository.create.mockReturnValue(mockProperty);
      mockPropertyRepository.save.mockResolvedValue(mockProperty);

      const result = await service.create(createPropertyDto);

      expect(repository.create).toHaveBeenCalledWith(createPropertyDto);
      expect(repository.save).toHaveBeenCalledWith(mockProperty);
      expect(result).toEqual(mockProperty);
    });
  });

  describe('findAll', () => {
    it('should return paginated properties', async () => {
      const properties = [mockProperty];
      mockPropertyRepository.findAndCount.mockResolvedValue([properties, 1]);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(repository.findAndCount).toHaveBeenCalledWith({
        relations: ['tasks'],
        order: { createdAt: 'DESC' },
        skip: 0,
        take: 10,
      });
      expect(result).toEqual({
        data: properties,
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
    });

    it('should use default pagination values', async () => {
      mockPropertyRepository.findAndCount.mockResolvedValue([[], 0]);

      await service.findAll();

      expect(repository.findAndCount).toHaveBeenCalledWith({
        relations: ['tasks'],
        order: { createdAt: 'DESC' },
        skip: 0,
        take: 10,
      });
    });
  });

  describe('findVacant', () => {
    it('should return only vacant properties', async () => {
      const properties = [mockProperty];
      mockPropertyRepository.find.mockResolvedValue(properties);

      const result = await service.findVacant();

      expect(repository.find).toHaveBeenCalledWith({
        where: { status: PropertyStatus.VACANT },
        relations: ['tasks'],
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual(properties);
    });
  });

  describe('findOne', () => {
    it('should return a property by id', async () => {
      mockPropertyRepository.findOne.mockResolvedValue(mockProperty);

      const result = await service.findOne('1');

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
        relations: ['tasks'],
      });
      expect(result).toEqual(mockProperty);
    });

    it('should throw NotFoundException if property not found', async () => {
      mockPropertyRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('999')).rejects.toThrow(NotFoundException);
      await expect(service.findOne('999')).rejects.toThrow(
        'Property with ID 999 not found',
      );
    });
  });

  describe('update', () => {
    it('should update a property', async () => {
      const updateDto = { monthlyRent: 1200 };
      const updatedProperty = { ...mockProperty, ...updateDto };

      mockPropertyRepository.findOne.mockResolvedValue(mockProperty);
      mockPropertyRepository.save.mockResolvedValue(updatedProperty);

      const result = await service.update('1', updateDto);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
        relations: ['tasks'],
      });
      expect(repository.save).toHaveBeenCalled();
      expect(result).toEqual(updatedProperty);
    });

    it('should throw NotFoundException if property to update not found', async () => {
      mockPropertyRepository.findOne.mockResolvedValue(null);

      await expect(service.update('999', {})).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should remove a property', async () => {
      mockPropertyRepository.findOne.mockResolvedValue(mockProperty);
      mockPropertyRepository.remove.mockResolvedValue(mockProperty);

      await service.remove('1');

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
        relations: ['tasks'],
      });
      expect(repository.remove).toHaveBeenCalledWith(mockProperty);
    });

    it('should throw NotFoundException if property to remove not found', async () => {
      mockPropertyRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getPropertyTasks', () => {
    it('should return tasks for a property', async () => {
      const tasks = [{ id: '1', description: 'Test task' }];
      const propertyWithTasks = { ...mockProperty, tasks };

      mockPropertyRepository.findOne.mockResolvedValue(propertyWithTasks);

      const result = await service.getPropertyTasks('1');

      expect(result).toEqual(tasks);
    });
  });
});

