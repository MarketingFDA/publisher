import { Module } from '@nestjs/common';
import { PadraoesController } from './padroes.controller';
import { PadraoesService } from './padroes.service';

@Module({ controllers: [PadraoesController], providers: [PadraoesService] })
export class PadraoesModule {}
