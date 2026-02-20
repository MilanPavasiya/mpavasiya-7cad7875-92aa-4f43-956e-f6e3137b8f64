import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { UserOrgRole } from '../entities/user-org-role.entity';
import { Organization } from '../entities/organization.entity';
import { PERMISSIONS_KEY } from './permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @InjectRepository(UserOrgRole)
    private readonly uorRepo: Repository<UserOrgRole>,
    @InjectRepository(Organization)
    private readonly orgRepo: Repository<Organization>,
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

    const whereClause = orgIds.length > 0
      ? { userId: user.id, orgId: In(orgIds) }
      : { userId: user.id };

    const assignments = await this.uorRepo.find({
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

      // Role inheritance: parent org roles grant access to child orgs
      if (assignment.org) {
        const children = await this.orgRepo.find({
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

    // Attach resolved data for downstream use
    request.userPermissions = userPermissions;
    request.userOrgIds = userOrgIds;

    return true;
  }

  private extractOrgId(request: any): string | undefined {
    return request.body?.orgId || request.query?.orgId || request.params?.orgId;
  }

  /**
   * Returns the given orgId plus its parent/child in the 2-level hierarchy,
   * so parent org roles cascade down to child orgs.
   */
  private async getAccessibleOrgIds(orgId: string): Promise<string[]> {
    const ids = [orgId];
    const org = await this.orgRepo.findOne({ where: { id: orgId } });
    if (!org) return ids;

    if (org.parentId) {
      ids.push(org.parentId);
    }

    const children = await this.orgRepo.find({ where: { parentId: orgId } });
    for (const child of children) {
      ids.push(child.id);
    }

    return ids;
  }
}
