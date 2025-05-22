import { Column, Entity } from 'typeorm';
import { BaseEntity } from './base.entity';
import { IBaseUser } from '@shared/interfaces/entities.interface';

@Entity('Users')
export class User extends BaseEntity implements IBaseUser {
  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255, select: false })
  password?: string;
}
