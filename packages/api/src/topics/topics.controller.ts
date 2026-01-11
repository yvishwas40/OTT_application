import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  UseGuards 
} from '@nestjs/common';
import { TopicsService } from './topics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('Topics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('topics')
export class TopicsController {
  constructor(private readonly topicsService: TopicsService) {}

  @ApiOperation({ summary: 'Get all topics' })
  @Get()
  findAll() {
    return this.topicsService.findAll();
  }

  @ApiOperation({ summary: 'Get topic by ID' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.topicsService.findOne(id);
  }

  @ApiOperation({ summary: 'Create new topic' })
  @Roles('ADMIN', 'EDITOR')
  @Post()
  create(@Body() createTopicDto: { name: string }) {
    return this.topicsService.create(createTopicDto);
  }

  @ApiOperation({ summary: 'Update topic' })
  @Roles('ADMIN', 'EDITOR')
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTopicDto: { name: string }) {
    return this.topicsService.update(id, updateTopicDto);
  }

  @ApiOperation({ summary: 'Delete topic' })
  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.topicsService.delete(id);
  }
}