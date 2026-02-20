import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { DataSource, In } from 'typeorm';
import { PERMISSIONS_KEY } from './permissions.decorator.js';

/**
 * Reusable RBAC guard that checks user permissions against route requirements.
 * Uses DataSource directly to stay decoupled from app-specific entity classes.
 * Expects tables: user_org_roles (with role.permissions relations), organizations.
 */
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly dataSource: DataSource,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const required = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!required || required.length === 0) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user) throw new ForbiddenException('Not authenticated');

    const orgId = this.extractOrgId(request);
    const orgIds = orgId ? await this.getAccessibleOrgIds(orgId) : [];

    const uorRepo = this.dataSource.getRepository('UserOrgRole');
    const whereClause = orgIds.length > 0
      ? { userId: user.id, orgId: In(orgIds) }
      : { userId: user.id };

    const assignments = await uorRepo.find({
      where: whereClause,
      relations: { role: { permissions: true }, org: true },
    });

    const userPermissions = new Set<string>();
    const userOrgIds = new Set<string>();

    for (const assignment of assignments) {
      userOrgIds.add(assignment.orgId);
      if (assignment.role?.permissions) {
        for (const perm of assignment.role.permissions) {
          userPermissions.add(perm.key);
        }
      }

      if (assignment.org) {
        const orgRepo = this.dataSource.getRepository('Organization');
        const children = await orgRepo.find({
          where: { parentId: assignment.orgId },
        });
        for (const child of children) {
          userOrgIds.add(child.id);
        }
      }
    }

    const hasAll = required.every((p) => userPermissions.has(p));
    if (!hasAll) {
      throw new ForbiddenException('Insufficient permissions');
    }

    request.userPermissions = userPermissions;
    request.userOrgIds = userOrgIds;

    return true;
  }

  private extractOrgId(request: any): string | undefined {
    return request.body?.orgId || request.query?.orgId || request.params?.orgId;
  }

  private async getAccessibleOrgIds(orgId: string): Promise<string[]> {
    const ids = [orgId];
    const orgRepo = this.dataSource.getRepository('Organization');
    const org = await orgRepo.findOne({ where: { id: orgId } });
    if (!org) return ids;

    if (org.parentId) {
      ids.push(org.parentId);
    }

    const children = await orgRepo.find({ where: { parentId: orgId } });
    for (const child of children) {
      ids.push(child.id);
    }

    return ids;
  }
}
