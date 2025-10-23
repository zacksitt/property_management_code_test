import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PropertiesService } from '../services/properties.service';
import { CreatePropertyDto } from '../dto/create-property.dto';
import { UpdatePropertyDto } from '../dto/update-property.dto';
import {
  ApiCreateProperty,
  ApiFindAllProperties,
  ApiFindVacantProperties,
  ApiFindOneProperty,
  ApiUpdateProperty,
  ApiDeleteProperty,
  ApiGetPropertyTasks,
} from '../documentation/properties.decorators';

@ApiTags('properties')
@Controller('properties')
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  @Post()
  @ApiCreateProperty()
  create(@Body() createPropertyDto: CreatePropertyDto) {
    return this.propertiesService.create(createPropertyDto);
  }

  @Get()
  @ApiFindAllProperties()
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.propertiesService.findAll({
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
    });
  }

  @Get('vacant')
  @ApiFindVacantProperties()
  findVacant() {
    return this.propertiesService.findVacant();
  }

  @Get(':id')
  @ApiFindOneProperty()
  findOne(@Param('id') id: string) {
    return this.propertiesService.findOne(id);
  }

  @Patch(':id')
  @ApiUpdateProperty()
  update(@Param('id') id: string, @Body() updatePropertyDto: UpdatePropertyDto) {
    return this.propertiesService.update(id, updatePropertyDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiDeleteProperty()
  remove(@Param('id') id: string) {
    return this.propertiesService.remove(id);
  }

  @Get(':id/tasks')
  @ApiGetPropertyTasks()
  getPropertyTasks(@Param('id') id: string) {
    return this.propertiesService.getPropertyTasks(id);
  }
}

