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
import { TermsService } from './terms.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('Terms')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('terms')
export class TermsController {
  constructor(private readonly termsService: TermsService) {}

  @ApiOperation({ summary: 'Get terms by program' })
  @Get()
  findByProgram(@Query('programId') programId: string) {
    return this.termsService.findByProgram(programId);
  }

  @ApiOperation({ summary: 'Get term by ID' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.termsService.findOne(id);
  }

  @ApiOperation({ summary: 'Create new term' })
  @Roles('ADMIN', 'EDITOR')
  @Post()
  create(@Body() createTermDto: any, @Request() req) {
    return this.termsService.create(createTermDto, req.user.role);
  }

  @ApiOperation({ summary: 'Update term' })
  @Roles('ADMIN', 'EDITOR')
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTermDto: any, @Request() req) {
    return this.termsService.update(id, updateTermDto, req.user.role);
  }

  @ApiOperation({ summary: 'Delete term' })
  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.termsService.delete(id, req.user.role);
  }
}