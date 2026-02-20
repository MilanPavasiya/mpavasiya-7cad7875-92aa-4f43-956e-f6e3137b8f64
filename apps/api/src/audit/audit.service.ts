import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { AuditLog } from '../entities/audit-log.entity';

export interface AuditEntry {
  action: string;
  resource: string;
  resourceId?: string;
  userId: string;
  userEmail?: string;
  orgId?: string;
  details?: string;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(
    @InjectRepository(AuditLog)
    private readonly auditRepo: Repository<AuditLog>,
  ) {}

  async log(entry: AuditEntry): Promise<AuditLog> {
    this.logger.log(
      `[AUDIT] ${entry.action} ${entry.resource} ${entry.resourceId ?? ''} by ${entry.userEmail ?? entry.userId}`,
    );

    const record = this.auditRepo.create({
      action: entry.action,
      resource: entry.resource,
      resourceId: entry.resourceId ?? null,
      userId: entry.userId,
      userEmail: entry.userEmail ?? null,
      orgId: entry.orgId ?? null,
      details: entry.details ?? null,
    });

    return this.auditRepo.save(record);
  }

  async findAll(orgIds?: string[]): Promise<AuditLog[]> {
    const where = orgIds && orgIds.length > 0 ? { orgId: In(orgIds) } : {};
    return this.auditRepo.find({
      where,
      order: { timestamp: 'DESC' },
      take: 200,
    });
  }
}
