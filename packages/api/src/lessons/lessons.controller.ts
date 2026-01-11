import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  UseGuards, 
  Request,
  Query 
} from '@nestjs/common';
import { LessonsService } from './lessons.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
// UserRole import removed because it's not exported from @prisma/client
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('Lessons')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('lessons')
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  @ApiOperation({ summary: 'Get all lessons' })
  @Get()
  findAll(@Query('termId') termId?: string) {
    return this.lessonsService.findAll(termId);
  }

  @ApiOperation({ summary: 'Get lesson by ID' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.lessonsService.findOne(id);
  }

  @ApiOperation({ summary: 'Create new lesson' })
  @Roles('ADMIN', 'EDITOR')
  @Post()
  create(@Body() createLessonDto: any, @Request() req) {
    return this.lessonsService.create(createLessonDto, req.user.role);
  }


  @ApiOperation({ summary: 'Update lesson' })
  @Roles('ADMIN', 'EDITOR')
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLessonDto: any, @Request() req) {
    return this.lessonsService.update(id, updateLessonDto, req.user.role);
  }

  @ApiOperation({ summary: 'Publish lesson immediately' })
  @Roles('ADMIN', 'EDITOR')
  @Post(':id/publish')
  publish(@Param('id') id: string, @Request() req) {
    return this.lessonsService.publish(id, req.user.role);
  }

  @ApiOperation({ summary: 'Schedule lesson for publishing' })
  @Roles('ADMIN', 'EDITOR')
  @Post(':id/schedule')
  schedule(@Param('id') id: string, @Body() body: { publishAt: string }, @Request() req) {
    return this.lessonsService.schedule(id, new Date(body.publishAt), req.user.role);
  }

  @ApiOperation({ summary: 'Archive lesson' })
  @Roles('ADMIN', 'EDITOR')
  @Post(':id/archive')
  archive(@Param('id') id: string, @Request() req) {
    return this.lessonsService.archive(id, req.user.role);
  }

  @ApiOperation({ summary: 'Delete lesson' })
  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.lessonsService.delete(id, req.user.role);
  }
}