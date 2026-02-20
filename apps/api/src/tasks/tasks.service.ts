import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Task } from '../entities/task.entity';
import { UserOrgRole } from '../entities/user-org-role.entity';
import { Organization } from '../entities/organization.entity';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task) private readonly taskRepo: Repository<Task>,
    @InjectRepository(UserOrgRole)
    private readonly uorRepo: Repository<UserOrgRole>,
    @InjectRepository(Organization)
    private readonly orgRepo: Repository<Organization>,
  ) {}

  async create(dto: { title: string; description?: string; orgId: string; category?: string }, userId: string) {
    const task = this.taskRepo.create({
      title: dto.title,
      description: dto.description ?? null,
      orgId: dto.orgId,
      createdById: userId,
      status: 'open',
      category: dto.category ?? 'General',
    });
    return this.taskRepo.save(task);
  }

  async findAccessible(userId: string, orgIds: Set<string>) {
    if (orgIds.size === 0) return [];

    return this.taskRepo.find({
      where: { orgId: In(Array.from(orgIds)) },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    const task = await this.taskRepo.findOne({ where: { id } });
    if (!task) throw new NotFoundException('Task not found');
    return task;
  }

  async update(
    id: string,
    dto: { title?: string; description?: string; status?: string; category?: string },
    userId: string,
    userOrgIds: Set<string>,
  ) {
    const task = await this.findOne(id);

    if (!userOrgIds.has(task.orgId)) {
      throw new ForbiddenException('No access to this task\'s organization');
    }

    if (dto.title !== undefined) task.title = dto.title;
    if (dto.description !== undefined) task.description = dto.description;
    if (dto.status !== undefined) task.status = dto.status;
    if (dto.category !== undefined) task.category = dto.category;

    return this.taskRepo.save(task);
  }

  async remove(id: string, userOrgIds: Set<string>) {
    const task = await this.findOne(id);

    if (!userOrgIds.has(task.orgId)) {
      throw new ForbiddenException('No access to this task\'s organization');
    }

    await this.taskRepo.remove(task);
    return { deleted: true, id };
  }

  /**
   * Get all org IDs a user can access based on their role assignments,
   * including child orgs of any parent org they have a role in.
   */
  async getAccessibleOrgIds(userId: string): Promise<Set<string>> {
    const assignments = await this.uorRepo.find({
      where: { userId },
      relations: { role: { permissions: true } },
    });

    const orgIds = new Set<string>();
    const hasTaskRead = (a: typeof assignments[0]) =>
      a.role?.permissions?.some((p) => p.key === 'task:read');

    for (const assignment of assignments) {
      if (!hasTaskRead(assignment)) continue;

      orgIds.add(assignment.orgId);

      const children = await this.orgRepo.find({
        where: { parentId: assignment.orgId },
      });
      for (const child of children) {
        orgIds.add(child.id);
      }
    }

    return orgIds;
  }
}
