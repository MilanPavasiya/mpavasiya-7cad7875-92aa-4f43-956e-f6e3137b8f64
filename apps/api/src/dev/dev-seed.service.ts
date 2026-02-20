import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Organization } from '../entities/organization.entity';
import { Permission } from '../entities/permission.entity';
import { Role } from '../entities/role.entity';
import * as bcrypt from 'bcryptjs';
import { User } from '../entities/user.entity';
import { UserOrgRole } from '../entities/user-org-role.entity';

@Injectable()
export class DevSeedService {
  constructor(
    @InjectRepository(Organization)
    private readonly orgRepo: Repository<Organization>,
    @InjectRepository(Permission)
    private readonly permRepo: Repository<Permission>,
    @InjectRepository(Role) private readonly roleRepo: Repository<Role>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(UserOrgRole)
    private readonly uorRepo: Repository<UserOrgRole>,
  ) {}

  async createAdminUser(orgName: string, email: string, password: string) {
    const seedResult = await this.seed(orgName);
    const orgId = seedResult.org.id;

    const ownerRole = await this.roleRepo.findOne({
      where: { name: 'Owner', orgId },
    });
    if (!ownerRole) {
      throw new Error('Owner role not found (seed did not create it)');
    }

    let user = await this.userRepo.findOne({ where: { email } });
    if (!user) {
      const passwordHash = await bcrypt.hash(password, 10);
      user = await this.userRepo.save(
        this.userRepo.create({ email, passwordHash, isActive: true }),
      );
    }

    const existing = await this.uorRepo.findOne({
      where: { userId: user.id, orgId, roleId: ownerRole.id },
    });

    const assignment =
      existing ??
      (await this.uorRepo.save(
        this.uorRepo.create({ userId: user.id, orgId, roleId: ownerRole.id }),
      ));

    return {
      ok: true,
      org: { id: orgId, name: orgName },
      user: { id: user.id, email: user.email },
      role: { id: ownerRole.id, name: ownerRole.name },
      assignmentId: assignment.id,
      note: 'Safe to run again',
    };
  }

  async seed(orgName: string) {
    // 1) Top-level org
    let org = await this.orgRepo.findOne({
      where: { name: orgName, parentId: IsNull() },
    });
    if (!org) {
      org = this.orgRepo.create({ name: orgName, parentId: null });
      org = await this.orgRepo.save(org);
    }

    // 2) Child org (2-level hierarchy demo)
    const childName = `${orgName} - Engineering`;
    let childOrg = await this.orgRepo.findOne({
      where: { name: childName, parentId: org.id },
    });
    if (!childOrg) {
      childOrg = this.orgRepo.create({ name: childName, parentId: org.id });
      childOrg = await this.orgRepo.save(childOrg);
    }

    // 3) Permissions (global set)
    const permissionKeys: Array<{ key: string; description: string }> = [
      { key: 'task:read', description: 'Read tasks' },
      { key: 'task:create', description: 'Create tasks' },
      { key: 'task:update', description: 'Update tasks' },
      { key: 'task:delete', description: 'Delete tasks' },
      { key: 'audit:read', description: 'Read audit logs' },
      { key: 'org:manage', description: 'Manage organizations' },
      { key: 'role:manage', description: 'Manage roles' },
    ];

    const perms: Permission[] = [];
    for (const p of permissionKeys) {
      let existing = await this.permRepo.findOne({ where: { key: p.key } });
      if (!existing) {
        existing = await this.permRepo.save(this.permRepo.create(p));
      }
      perms.push(existing);
    }

    const byKey = new Map(perms.map((p) => [p.key, p]));
    const mustGetPerm = (key: string) => {
      const p = byKey.get(key);
      if (!p) throw new Error(`Missing permission in seed: ${key}`);
      return p;
    };

    // 4) Roles: Owner, Admin, Viewer
    // Owner: all permissions
    // Admin: task CRUD + audit read (no org:manage, role:manage)
    // Viewer: task read only
    const roleDefs = [
      {
        name: 'Owner',
        description: 'Full access including org and role management',
        permKeys: permissionKeys.map((p) => p.key),
      },
      {
        name: 'Admin',
        description: 'Task management and audit log access',
        permKeys: [
          'task:read',
          'task:create',
          'task:update',
          'task:delete',
          'audit:read',
        ],
      },
      {
        name: 'Viewer',
        description: 'Read-only access to tasks',
        permKeys: ['task:read'],
      },
    ];

    const createRolesForOrg = async (targetOrg: Organization) => {
      const saved: Role[] = [];
      for (const r of roleDefs) {
        let role = await this.roleRepo.findOne({
          where: { name: r.name, orgId: targetOrg.id },
          relations: { permissions: true },
        });
        if (!role) {
          role = this.roleRepo.create({
            name: r.name,
            description: r.description,
            orgId: targetOrg.id,
            permissions: r.permKeys.map(mustGetPerm),
          });
        } else {
          role.permissions = r.permKeys.map(mustGetPerm);
          role.description = r.description;
        }
        saved.push(await this.roleRepo.save(role));
      }
      return saved;
    };

    const createdRoles = await createRolesForOrg(org);

    // 5) Demo users: owner, admin, viewer
    const demoUsers = [
      { email: 'owner@demo.com', password: 'owner123', roleName: 'Owner' },
      { email: 'admin@demo.com', password: 'admin123', roleName: 'Admin' },
      { email: 'viewer@demo.com', password: 'viewer123', roleName: 'Viewer' },
    ];

    const createdUsers: Array<{ email: string; role: string; orgId: string }> = [];

    for (const du of demoUsers) {
      let user = await this.userRepo.findOne({ where: { email: du.email } });
      if (!user) {
        const passwordHash = await bcrypt.hash(du.password, 10);
        user = await this.userRepo.save(
          this.userRepo.create({ email: du.email, passwordHash, isActive: true }),
        );
      }

      const role = createdRoles.find((r) => r.name === du.roleName);
      if (role) {
        const existing = await this.uorRepo.findOne({
          where: { userId: user.id, orgId: org.id, roleId: role.id },
        });
        if (!existing) {
          await this.uorRepo.save(
            this.uorRepo.create({ userId: user.id, orgId: org.id, roleId: role.id }),
          );
        }
        createdUsers.push({ email: du.email, role: du.roleName, orgId: org.id });
      }
    }

    return {
      ok: true,
      org,
      childOrg,
      permissionsCreatedOrFound: perms.length,
      createdRoles: createdRoles.map((r) => ({ id: r.id, name: r.name })),
      demoUsers: createdUsers,
      credentials: demoUsers.map((u) => ({ email: u.email, password: u.password })),
      runAgainSafe: true,
    };
  }
}
