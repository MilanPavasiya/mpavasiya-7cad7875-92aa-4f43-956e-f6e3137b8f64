import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from '../entities/task.entity';
import { UserOrgRole } from '../entities/user-org-role.entity';
import { Organization } from '../entities/organization.entity';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { PermissionsGuard } from '@org/auth';

@Module({
  imports: [TypeOrmModule.forFeature([Task, UserOrgRole, Organization])],
  providers: [TasksService, PermissionsGuard],
  controllers: [TasksController],
})
export class TasksModule {}
