import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Organization } from '../entities/organization.entity';
import { OrgsService } from './orgs.service';
import { OrgsController } from './orgs.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Organization])],
  providers: [OrgsService],
  controllers: [OrgsController],
})
export class OrgsModule {}
