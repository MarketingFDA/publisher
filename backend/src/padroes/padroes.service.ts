import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PadraoesService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.padrao.findMany({ orderBy: { code: 'asc' } });
  }
}
