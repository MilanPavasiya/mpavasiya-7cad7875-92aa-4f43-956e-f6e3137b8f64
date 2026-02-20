import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization } from '../entities/organization.entity';

@Injectable()
export class OrgsService {
  constructor(
    @InjectRepository(Organization)
    private readonly orgRepo: Repository<Organization>
  ) {}

  findAll() {
    return this.orgRepo.find({
      select: ['id', 'name', 'parentId', 'createdAt', 'updatedAt'],
      order: { createdAt: 'DESC' },
    });
  }
}
