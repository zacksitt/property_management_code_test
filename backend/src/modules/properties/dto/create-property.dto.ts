import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  MaxLength,
  MinLength,
  Max,
} from 'class-validator';
import { PropertyStatus } from '../../../common/enums/property-status.enum';

export class CreatePropertyDto {
  @ApiProperty({ example: 'Bangkok Condo 101' })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: '123 Sukhumvit Road, Bangkok' })
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(200)
  address: string;

  @ApiProperty({ example: 'John Smith' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  ownerName: string;

  @ApiProperty({ example: 1200.5, description: 'Monthly rent (max: 99,999,999.99)' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @Max(99999999.99)
  monthlyRent: number;

  @ApiProperty({ enum: PropertyStatus, example: PropertyStatus.VACANT })
  @IsEnum(PropertyStatus)
  status: PropertyStatus;
}

