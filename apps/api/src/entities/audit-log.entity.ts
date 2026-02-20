import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity({ name: 'audit_logs' })
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'text' })
  action!: string;

  @Column({ type: 'text' })
  resource!: string;

  @Column({ type: 'uuid', nullable: true })
  resourceId!: string | null;

  @Index()
  @Column({ type: 'uuid' })
  userId!: string;

  @Column({ type: 'text', nullable: true })
  userEmail!: string | null;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  orgId!: string | null;

  @Column({ type: 'text', nullable: true })
  details!: string | null;

  @CreateDateColumn()
  timestamp!: Date;
}
