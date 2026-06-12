import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ContentService {
  constructor(private prisma: PrismaService) {}

  async create(data: { title: string; body: string; personaId: string; theme?: string }) {
    const padrao = await this.prisma.padrao.findFirst({ where: { code: 'T' } });
    if (!padrao) throw new NotFoundException('Padrão texto não encontrado. Execute o seed do banco.');
    const slides = JSON.stringify({
      category: 'TEXTO AVULSO',
      brand: 'PUBLISHER',
      slides: [{ index: 1, eyebrow: '', headline: data.title, accentWord: '', body: data.body, highlight: '', cta: '', shapes: [], images: [] }],
    });
    return this.prisma.content.create({
      data: { title: data.title, theme: data.theme || 'Texto Avulso', slides, personaId: data.personaId, padraoId: padrao.id, status: 'draft' },
      include: { persona: true, padrao: true },
    });
  }

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
