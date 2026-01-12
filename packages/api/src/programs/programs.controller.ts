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
import { ProgramsService } from './programs.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('Programs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('programs')
export class ProgramsController {
  constructor(private readonly programsService: ProgramsService) {}

  @ApiOperation({ summary: 'Get all programs' })
  @Get()
  findAll(@Query() filters: any) {
    return this.programsService.findAll(filters);
  }

  @ApiOperation({ summary: 'Get program by ID' })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.programsService.findOne(id);
  }

  @ApiOperation({ summary: 'Create new program' })
  @Roles('ADMIN', 'EDITOR')
  @Post()
  create(@Body() createProgramDto: any, @Request() req) {
    return this.programsService.create(createProgramDto, req.user.role);
  }

  @ApiOperation({ summary: 'Update program' })
  @Roles('ADMIN', 'EDITOR')
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProgramDto: any, @Request() req) {
    return this.programsService.update(id, updateProgramDto, req.user.role);
  }

  @ApiOperation({ summary: 'Delete program' })
  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.programsService.delete(id, req.user.role);
  }
}