import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { PersonasModule } from './personas/personas.module';
import { PadraoesModule } from './padroes/padroes.module';
import { GenerationModule } from './generation/generation.module';
import { UploadsModule } from './uploads/uploads.module';
import { ContentModule } from './content/content.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    PersonasModule,
    PadraoesModule,
    GenerationModule,
    UploadsModule,
    ContentModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
