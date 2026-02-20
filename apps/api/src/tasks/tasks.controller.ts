import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { PermissionsGuard, RequirePermissions } from '@org/auth';
import { AuditService } from '../audit/audit.service';

@Controller('tasks')
@UseGuards(PermissionsGuard)
export class TasksController {
  constructor(
    private readonly tasksService: TasksService,
    private readonly auditService: AuditService,
  ) {}

  @Post()
  @RequirePermissions('task:create')
  async create(
    @Body() body: { title: string; description?: string; orgId: string },
    @Req() req: any,
  ) {
    const task = await this.tasksService.create(body, req.user.id);

    await this.auditService.log({
      action: 'CREATE',
      resource: 'task',
      resourceId: task.id,
      userId: req.user.id,
      userEmail: req.user.email,
      orgId: body.orgId,
    });

    return task;
  }

  @Get()
  @RequirePermissions('task:read')
  async findAll(@Req() req: any) {
    const orgIds: Set<string> =
      req.userOrgIds ?? (await this.tasksService.getAccessibleOrgIds(req.user.id));

    await this.auditService.log({
      action: 'READ',
      resource: 'task',
      userId: req.user.id,
      userEmail: req.user.email,
      details: `Listed tasks for ${orgIds.size} org(s)`,
    });

    return this.tasksService.findAccessible(req.user.id, orgIds);
  }

  @Put(':id')
  @RequirePermissions('task:update')
  async update(
    @Param('id') id: string,
    @Body() body: { title?: string; description?: string; status?: string },
    @Req() req: any,
  ) {
    const orgIds: Set<string> =
      req.userOrgIds ?? (await this.tasksService.getAccessibleOrgIds(req.user.id));

    const task = await this.tasksService.update(id, body, req.user.id, orgIds);

    await this.auditService.log({
      action: 'UPDATE',
      resource: 'task',
      resourceId: id,
      userId: req.user.id,
      userEmail: req.user.email,
      orgId: task.orgId,
    });

    return task;
  }

  @Delete(':id')
  @RequirePermissions('task:delete')
  async remove(@Param('id') id: string, @Req() req: any) {
    const orgIds: Set<string> =
      req.userOrgIds ?? (await this.tasksService.getAccessibleOrgIds(req.user.id));

    const task = await this.tasksService.findOne(id);

    await this.auditService.log({
      action: 'DELETE',
      resource: 'task',
      resourceId: id,
      userId: req.user.id,
      userEmail: req.user.email,
      orgId: task.orgId,
    });

    return this.tasksService.remove(id, orgIds);
  }
}
