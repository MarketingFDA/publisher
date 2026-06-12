import { Controller, Get, Param, Patch, Put, Post, Body, Delete } from '@nestjs/common';
import { ContentService } from './content.service';

@Controller('content')
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @Post()
  create(@Body() body: { title: string; body: string; personaId: string; theme?: string }) {
    return this.contentService.create(body);
  }

  @Get()
  findAll() { return this.contentService.findAll(); }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.contentService.findOne(id); }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: { title?: string; slides?: string }) {
    return this.contentService.update(id, body);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.contentService.updateStatus(id, status);
  }

  @Delete(':id')
  remove(@Param('id') id: string) { return this.contentService.remove(id); }
}
