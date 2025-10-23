import { DataSource } from 'typeorm';
import { Property } from './entities/property.entity';
import { Task } from './entities/task.entity';
import * as dotenv from 'dotenv'

dotenv.config()
console.log(process.env.DB_HOST, process.env.DB_PORT, process.env.DB_USERNAME, process.env.DB_PASSWORD, process.env.DB_DATABASE);
export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: [Property, Task],
  migrations: ['src/database/migrations/*.ts'],
  synchronize: false,
  logging: true,
});

