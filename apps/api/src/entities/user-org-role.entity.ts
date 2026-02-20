import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  Unique,
} from 'typeorm';
import { User } from './user.entity';
import { Organization } from './organization.entity';
import { Role } from './role.entity';

@Entity({ name: 'user_org_roles' })
@Unique('UQ_user_org_role', ['userId', 'orgId', 'roleId'])
export class UserOrgRole {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ type: 'uuid' })
  userId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Index()
  @Column({ type: 'uuid' })
  orgId!: string;

  @ManyToOne(() => Organization, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'orgId' })
  org!: Organization;

  @Index()
  @Column({ type: 'uuid' })
  roleId!: string;

  @ManyToOne(() => Role, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'roleId' })
  role!: Role;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
