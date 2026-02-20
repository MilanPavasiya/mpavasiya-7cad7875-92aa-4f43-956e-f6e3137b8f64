import { Controller, Get } from '@nestjs/common';
import { OrgsService } from './orgs.service';

@Controller('orgs')
export class OrgsController {
  constructor(private readonly orgsService: OrgsService) {}

  @Get()
  findAll() {
    return this.orgsService.findAll();
  }
}
