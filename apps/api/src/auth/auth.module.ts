import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { UserOrgRole } from '../entities/user-org-role.entity';
import { Organization } from '../entities/organization.entity';
import { Role } from '../entities/role.entity';
import { JwtAuthGuard } from '@org/auth';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-dev-key-change-in-prod';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserOrgRole, Organization, Role]),
    JwtModule.register({
      secret: JWT_SECRET,
      signOptions: { expiresIn: '24h' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtAuthGuard],
  exports: [JwtModule, JwtAuthGuard, AuthService],
})
export class AuthModule {}
