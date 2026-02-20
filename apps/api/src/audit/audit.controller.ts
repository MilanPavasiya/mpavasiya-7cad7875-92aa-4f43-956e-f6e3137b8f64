import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { AuditService } from './audit.service';
import { PermissionsGuard, RequirePermissions } from '@org/auth';

@Controller('audit-log')
@UseGuards(PermissionsGuard)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @RequirePermissions('audit:read')
  async findAll(@Req() req: any) {
    const orgIds: Set<string> | undefined = req.userOrgIds;
    return this.auditService.findAll(orgIds ? Array.from(orgIds) : undefined);
  }
}
