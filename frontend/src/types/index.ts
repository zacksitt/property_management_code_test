export enum PropertyStatus {
  OCCUPIED = 'OCCUPIED',
  VACANT = 'VACANT',
  MAINTENANCE = 'MAINTENANCE',
}

export enum TaskType {
  CLEANING = 'CLEANING',
  MAINTENANCE = 'MAINTENANCE',
  INSPECTION = 'INSPECTION',
}

export enum TaskStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
}

export interface Property {
  id: string;
  name: string;
  address: string;
  ownerName: string;
  monthlyRent: number;
  status: PropertyStatus;
  createdAt: string;
  updatedAt: string;
  tasks?: Task[];
}

export interface Task {
  id: string;
  propertyId: string;
  description: string;
  type: TaskType;
  assignedTo: string;
  status: TaskStatus;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
  property?: Property;
}

export interface CreatePropertyDto {
  name: string;
  address: string;
  ownerName: string;
  monthlyRent: number;
  status: PropertyStatus;
}

export interface CreateTaskDto {
  propertyId: string;
  description: string;
  type: TaskType;
  assignedTo: string;
  status?: TaskStatus;
  dueDate: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

