import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { UserRolesService } from './user-roles.service';

@Controller()
export class UserRolesController {
  constructor(private readonly userRolesService: UserRolesService) {}

  // POST /api/user-roles/assign
  @Post('user-roles/assign')
  assign(@Body() body: { userId: string; orgId: string; roleId: string }) {
    return this.userRolesService.assign(body.userId, body.orgId, body.roleId);
  }

  // GET /api/users/:id/roles
  @Get('users/:id/roles')
  listUserRoles(@Param('id') id: string) {
    return this.userRolesService.listUserRoles(id);
  }
}
