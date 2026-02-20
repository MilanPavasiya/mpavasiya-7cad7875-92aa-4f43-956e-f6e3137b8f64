import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToMany,
  JoinTable,
  OneToMany,
} from 'typeorm';
import { Organization } from './organization.entity';
import { Permission } from './permission.entity';
import { UserOrgRole } from './user-org-role.entity';

@Entity({ name: 'roles' })
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ type: 'text' })
  name!: string; // e.g., Admin, Manager, Member

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  // Roles belong to an organization (top-level or child org)
  @Index()
  @Column({ type: 'uuid' })
  orgId!: string;

  @ManyToOne(() => Organization, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'orgId' })
  org!: Organization;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @ManyToMany(() => Permission, { cascade: false })
  @JoinTable({
    name: 'role_permissions',
    joinColumn: { name: 'roleId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'permissionId', referencedColumnName: 'id' },
  })
  permissions!: Permission[];

  @OneToMany(() => UserOrgRole, (uor) => uor.role)
  userAssignments!: UserOrgRole[];
}
