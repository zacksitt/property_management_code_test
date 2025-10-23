import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';
import { TaskType } from '../../../common/enums/task-type.enum';
import { TaskStatus } from '../../../common/enums/task-status.enum';

export class CreateTaskDto {
  @ApiProperty({ example: 'uuid-of-property' })
  @IsUUID()
  @IsNotEmpty()
  propertyId: string;

  @ApiProperty({ example: 'Clean apartment before new tenant' })
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(500)
  description: string;

  @ApiProperty({ enum: TaskType, example: TaskType.CLEANING })
  @IsEnum(TaskType)
  type: TaskType;

  @ApiProperty({ example: 'Maria Garcia' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  assignedTo: string;

  @ApiProperty({ enum: TaskStatus, example: TaskStatus.PENDING, required: false })
  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;

  @ApiProperty({ example: '2024-11-01T00:00:00.000Z' })
  @IsDateString()
  @IsNotEmpty()
  dueDate: string;
}

