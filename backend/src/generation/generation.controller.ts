import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { GenerationService } from './generation.service';

export class GenerateDto {
  personaId: string;
  padraoId: string;
  theme: string;
}

@Controller('generation')
export class GenerationController {
  constructor(private readonly generationService: GenerationService) {}

  @Post('generate')
  @HttpCode(200)
  generate(@Body() dto: GenerateDto) {
    return this.generationService.generate(dto.personaId, dto.padraoId, dto.theme);
  }

  @Post('regenerate')
  @HttpCode(200)
  regenerate(@Body() dto: GenerateDto & { slideIndex?: number }) {
    return this.generationService.generate(dto.personaId, dto.padraoId, dto.theme);
  }
}
