import { Controller, Get, Param, Query, Header, NotFoundException } from '@nestjs/common';
import { CatalogService } from './catalog.service';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';

@ApiTags('Public Catalog')
@Controller('catalog')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @ApiOperation({ summary: 'Get published programs (public API)' })
  @ApiQuery({ name: 'cursor', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @Header('Cache-Control', 'public, max-age=300') // Cache for 5 minutes
  @Get('programs')
  async getPrograms(
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ) {
    const limitNum = limit ? parseInt(limit, 10) : 20;
    return this.catalogService.getPrograms(cursor, limitNum);
  }

  @ApiOperation({ summary: 'Get published program by ID (public API)' })
  @Header('Cache-Control', 'public, max-age=300')
  @Get('programs/:id')
  async getProgram(@Param('id') id: string) {
    const program = await this.catalogService.getProgram(id);
    if (!program) {
      throw new NotFoundException('Program not found or not published');
    }
    return program;
  }

  @ApiOperation({ summary: 'Get published lesson by ID (public API)' })
  @Header('Cache-Control', 'public, max-age=300')
  @Get('lessons/:id')
  async getLesson(@Param('id') id: string) {
    const lesson = await this.catalogService.getLesson(id);
    if (!lesson) {
      throw new NotFoundException('Lesson not found or not published');
    }
    return lesson;
  }
}