import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from '../entities/permission.entity';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(Permission)
    private readonly permRepo: Repository<Permission>
  ) {}

  findAll() {
    return this.permRepo.find({
      select: ['id', 'key', 'description', 'createdAt', 'updatedAt'],
      order: { key: 'ASC' },
    });
  }
}
