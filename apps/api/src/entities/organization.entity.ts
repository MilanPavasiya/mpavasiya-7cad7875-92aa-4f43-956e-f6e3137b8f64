import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity({ name: 'organizations' })
export class Organization {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ type: 'text' })
  name!: string;

  // Parent org (null = top-level)
  @Index()
  @Column({ type: 'uuid', nullable: true })
  parentId!: string | null;

  @ManyToOne(() => Organization, (org) => org.children, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'parentId' })
  parent!: Organization | null;

  @OneToMany(() => Organization, (org) => org.parent)
  children!: Organization[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
