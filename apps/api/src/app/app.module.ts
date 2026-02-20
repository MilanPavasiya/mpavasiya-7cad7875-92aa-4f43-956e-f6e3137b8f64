import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users/users.module';
import { OrgsModule } from '../orgs/orgs.module';
import { RolesModule } from '../roles/roles.module';
import { PermissionsModule } from '../permissions/permissions.module';
import { DevModule } from '../dev/dev.module';
import { UserRolesModule } from '../user-roles/user-roles.module';
import { AuthModule } from '../auth/auth.module';
import { AuditModule } from '../audit/audit.module';
import { TasksModule } from '../tasks/tasks.module';
import { JwtAuthGuard } from '@org/auth';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: 'db.sqlite',
      autoLoadEntities: true,
      synchronize: true,
    }),
    AuthModule,
    AuditModule,
    UsersModule,
    OrgsModule,
    RolesModule,
    PermissionsModule,
    DevModule,
    UserRolesModule,
    TasksModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
  ],
})
export class AppModule {}
