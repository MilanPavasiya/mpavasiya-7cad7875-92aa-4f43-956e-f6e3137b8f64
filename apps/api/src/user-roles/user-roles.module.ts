import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Organization } from '../entities/organization.entity';
import { Role } from '../entities/role.entity';
import { UserOrgRole } from '../entities/user-org-role.entity';
import { UserRolesService } from './user-roles.service';
import { UserRolesController } from './user-roles.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User, Organization, Role, UserOrgRole])],
  providers: [UserRolesService],
  controllers: [UserRolesController],
})
export class UserRolesModule {}
