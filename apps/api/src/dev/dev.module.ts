import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DevController } from './dev.controller';
import { DevSeedService } from './dev-seed.service';
import { Organization } from '../entities/organization.entity';
import { Role } from '../entities/role.entity';
import { Permission } from '../entities/permission.entity';
import { User } from '../entities/user.entity';
import { UserOrgRole } from '../entities/user-org-role.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Organization,
      Permission,
      Role,
      User,
      UserOrgRole,
    ]),
  ],
  controllers: [DevController],
  providers: [DevSeedService],
})
export class DevModule {}
