import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UploadsService {
  constructor(private prisma: PrismaService) {}

  save(file: Express.Multer.File) {
    return this.prisma.upload.create({
      data: {
        filename: file.originalname,
        path: file.filename,
        mimetype: file.mimetype,
        size: file.size,
      },
    });
  }
}
