import { Controller, Get } from '@nestjs/common';
import { PadraoesService } from './padroes.service';

@Controller('padroes')
export class PadraoesController {
  constructor(private readonly padraoesService: PadraoesService) {}

  @Get()
  findAll() {
    return this.padraoesService.findAll();
  }
}
