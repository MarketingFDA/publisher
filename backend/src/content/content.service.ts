import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ContentService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.content.findMany({
      include: { persona: true, padrao: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  findOne(id: string) {
    return this.prisma.content.findUnique({
      where: { id },
      include: { persona: true, padrao: true },
    });
  }

  update(id: string, data: { title?: string; slides?: string }) {
    return this.prisma.content.update({ where: { id }, data });
  }

  updateStatus(id: string, status: string) {
    return this.prisma.content.update({ where: { id }, data: { status } });
  }

  remove(id: string) {
    return this.prisma.content.delete({ where: { id } });
  }
}
