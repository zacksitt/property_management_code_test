import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { TasksService } from '../tasks.service';
import { Task } from '../../../../databases/typeorm/entities/task.entity';
import { Property } from '../../../../databases/typeorm/entities/property.entity';
import { TaskStatus } from '../../../../common/enums/task-status.enum';
import { TaskType } from '../../../../common/enums/task-type.enum';

describe('TasksService', () => {
  let service: TasksService;
  let taskRepository: Repository<Task>;
  let propertyRepository: Repository<Property>;

  const mockTask = {
    id: '1',
    propertyId: 'prop_1',
    description: 'Test task',
    type: TaskType.CLEANING,
    assignedTo: 'John Doe',
    status: TaskStatus.PENDING,
    dueDate: new Date('2024-12-31'),
    createdAt: new Date(),
    updatedAt: new Date(),
    property: {
      id: 'prop_1',
      name: 'Test Property',
    },
  };

  const mockProperty = {
    id: 'prop_1',
    name: 'Test Property',
  };

  const mockTaskRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockPropertyRepository = {
    findOne: jest.fn(),
  };

  const mockQueryBuilder = {
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getCount: jest.fn(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: getRepositoryToken(Task),
          useValue: mockTaskRepository,
        },
        {
          provide: getRepositoryToken(Property),
          useValue: mockPropertyRepository,
        },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
    taskRepository = module.get<Repository<Task>>(getRepositoryToken(Task));
    propertyRepository = module.get<Repository<Property>>(
      getRepositoryToken(Property),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new task', async () => {
      const createTaskDto = {
        propertyId: 'prop_1',
        description: 'Test task',
        type: TaskType.CLEANING,
        assignedTo: 'John Doe',
        status: TaskStatus.PENDING,
        dueDate: '2024-12-31',
      };

      mockPropertyRepository.findOne.mockResolvedValue(mockProperty);
      mockTaskRepository.create.mockReturnValue(mockTask);
      mockTaskRepository.save.mockResolvedValue(mockTask);

      const result = await service.create(createTaskDto);

      expect(propertyRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'prop_1' },
      });
      expect(taskRepository.create).toHaveBeenCalled();
      expect(taskRepository.save).toHaveBeenCalledWith(mockTask);
      expect(result).toEqual(mockTask);
    });

    it('should throw NotFoundException if property not found', async () => {
      const createTaskDto = {
        propertyId: 'invalid_id',
        description: 'Test task',
        type: TaskType.CLEANING,
        assignedTo: 'John Doe',
        status: TaskStatus.PENDING,
        dueDate: '2024-12-31',
      };

      mockPropertyRepository.findOne.mockResolvedValue(null);

      await expect(service.create(createTaskDto)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.create(createTaskDto)).rejects.toThrow(
        'Property with ID invalid_id not found',
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated tasks', async () => {
      const tasks = [mockTask];
      mockTaskRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockQueryBuilder.getCount.mockResolvedValue(1);
      mockQueryBuilder.getMany.mockResolvedValue(tasks);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result).toEqual({
        data: tasks,
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
    });

    it('should apply filters correctly', async () => {
      mockTaskRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockQueryBuilder.getCount.mockResolvedValue(0);
      mockQueryBuilder.getMany.mockResolvedValue([]);

      await service.findAll({
        status: TaskStatus.PENDING,
        type: TaskType.CLEANING,
        propertyId: 'prop_1',
      });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledTimes(3);
    });
  });

  describe('findOne', () => {
    it('should return a task by id', async () => {
      mockTaskRepository.findOne.mockResolvedValue(mockTask);

      const result = await service.findOne('1');

      expect(taskRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
        relations: ['property'],
      });
      expect(result).toEqual(mockTask);
    });

    it('should throw NotFoundException if task not found', async () => {
      mockTaskRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('999')).rejects.toThrow(NotFoundException);
      await expect(service.findOne('999')).rejects.toThrow(
        'Task with ID 999 not found',
      );
    });
  });

  describe('update', () => {
    it('should update a task', async () => {
      const updateDto = { description: 'Updated task' };
      const updatedTask = { ...mockTask, ...updateDto };

      mockTaskRepository.findOne.mockResolvedValue(mockTask);
      mockTaskRepository.save.mockResolvedValue(updatedTask);

      const result = await service.update('1', updateDto);

      expect(taskRepository.save).toHaveBeenCalled();
      expect(result).toEqual(updatedTask);
    });

    it('should throw NotFoundException if task to update not found', async () => {
      mockTaskRepository.findOne.mockResolvedValue(null);

      await expect(service.update('999', {})).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should remove a task', async () => {
      mockTaskRepository.findOne.mockResolvedValue(mockTask);
      mockTaskRepository.remove.mockResolvedValue(mockTask);

      await service.remove('1');

      expect(taskRepository.remove).toHaveBeenCalledWith(mockTask);
    });

    it('should throw NotFoundException if task to remove not found', async () => {
      mockTaskRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('999')).rejects.toThrow(NotFoundException);
    });
  });
});

