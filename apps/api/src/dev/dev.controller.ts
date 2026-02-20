import { Body, Controller, Post, Query } from '@nestjs/common';
import { DevSeedService } from './dev-seed.service';
import { Public } from '@org/auth';

@Public()
@Controller('dev')
export class DevController {
  constructor(private readonly seedService: DevSeedService) {}

  // POST /api/dev/seed?org=Acme
  @Post('seed')
  seed(@Query('org') orgName = 'Demo Org') {
    return this.seedService.seed(orgName);
  }

  // POST /api/dev/create-admin?org=Acme
  @Post('create-admin')
  createAdmin(
    @Query('org') orgName = 'Acme',
    @Body() body: { email: string; password: string }
  ) {
    return this.seedService.createAdminUser(orgName, body.email, body.password);
  }
}
