import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../entities/user.entity';
import { Organization } from '../entities/organization.entity';
import { Role } from '../entities/role.entity';
import { UserOrgRole } from '../entities/user-org-role.entity';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Organization) private readonly orgRepo: Repository<Organization>,
    @InjectRepository(Role) private readonly roleRepo: Repository<Role>,
    @InjectRepository(UserOrgRole) private readonly uorRepo: Repository<UserOrgRole>,
    private readonly jwtService: JwtService,
  ) {}

  async register(email: string, password: string) {
    const existing = await this.userRepo.findOne({ where: { email } });
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await this.userRepo.save(
      this.userRepo.create({ email, passwordHash, isActive: true }),
    );

    await this.assignDefaultViewerRole(user);

    const token = this.signToken(user);
    return {
      user: { id: user.id, email: user.email },
      access_token: token,
    };
  }

  private async assignDefaultViewerRole(user: User) {
    try {
      const org = await this.orgRepo.findOne({
        where: { parentId: IsNull() },
        order: { createdAt: 'ASC' },
      });
      if (!org) {
        this.logger.warn('No organization found - skipping default role assignment');
        return;
      }

      const viewerRole = await this.roleRepo.findOne({
        where: { name: 'Viewer', orgId: org.id },
      });
      if (!viewerRole) {
        this.logger.warn(`Viewer role not found for org ${org.name} - skipping`);
        return;
      }

      await this.uorRepo.save(
        this.uorRepo.create({ userId: user.id, orgId: org.id, roleId: viewerRole.id }),
      );
      this.logger.log(`Assigned Viewer role in "${org.name}" to ${user.email}`);
    } catch (err) {
      this.logger.error('Failed to assign default role', err);
    }
  }

  async login(email: string, password: string) {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is disabled');
    }

    const token = this.signToken(user);
    return {
      user: { id: user.id, email: user.email },
      access_token: token,
    };
  }

  private signToken(user: User): string {
    return this.jwtService.sign({ sub: user.id, email: user.email });
  }
}
