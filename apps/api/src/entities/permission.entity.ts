import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity({ name: 'permissions' })
export class Permission {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // Example values: "task:read", "task:create", "audit:read"
  @Index({ unique: true })
  @Column({ type: 'text' })
  key!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
