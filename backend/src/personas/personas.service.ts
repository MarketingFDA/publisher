import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PersonasService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.persona.findMany({ orderBy: { name: 'asc' } });
  }
}
