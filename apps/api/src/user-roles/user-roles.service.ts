import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Organization } from '../entities/organization.entity';
import { Role } from '../entities/role.entity';
import { UserOrgRole } from '../entities/user-org-role.entity';

@Injectable()
export class UserRolesService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Organization)
    private readonly orgRepo: Repository<Organization>,
    @InjectRepository(Role) private readonly roleRepo: Repository<Role>,
    @InjectRepository(UserOrgRole)
    private readonly uorRepo: Repository<UserOrgRole>
  ) {}

  async assign(userId: string, orgId: string, roleId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const org = await this.orgRepo.findOne({ where: { id: orgId } });
    if (!org) throw new NotFoundException('Organization not found');

    const role = await this.roleRepo.findOne({ where: { id: roleId } });
    if (!role) throw new NotFoundException('Role not found');

    if (role.orgId !== orgId) {
      throw new BadRequestException(
        'Role does not belong to this organization'
      );
    }

    const existing = await this.uorRepo.findOne({
      where: { userId, orgId, roleId },
    });
    if (existing) return existing;

    const record = this.uorRepo.create({ userId, orgId, roleId });
    return this.uorRepo.save(record);
  }

  async listUserRoles(userId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    return this.uorRepo.find({
      where: { userId },
      relations: { role: true, org: true },
      order: { createdAt: 'DESC' },
    });
  }
}
