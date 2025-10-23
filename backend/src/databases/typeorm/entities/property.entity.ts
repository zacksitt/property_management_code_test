import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { PropertyStatus } from '../../../common/enums/property-status.enum';
import { Task } from './task.entity';

/**
 * Property Entity
 * Represents a property in the property management system
 */
@Entity('properties')
@Index(['status'])
@Index(['createdAt'])
export class Property {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 200 })
  address: string;

  @Column({ name: 'owner_name', length: 100 })
  ownerName: string;

  @Column({ name: 'monthly_rent', type: 'decimal', precision: 10, scale: 2 })
  monthlyRent: number;

  @Column({
    type: 'enum',
    enum: PropertyStatus,
    default: PropertyStatus.VACANT,
  })
  status: PropertyStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => Task, (task) => task.property, { cascade: true })
  tasks: Task[];
}

