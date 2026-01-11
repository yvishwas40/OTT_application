import { 
  Controller, 
  Post, 
  Body, 
  Delete, 
  Param, 
  UseGuards, 
  Request 
} from '@nestjs/common';
import { AssetsService } from './assets.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('Assets')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('assets')
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @ApiOperation({ summary: 'Create or update program asset' })
  @Roles('ADMIN', 'EDITOR')
  @Post('programs')
  createProgramAsset(@Body() createAssetDto: any, @Request() req) {
    return this.assetsService.createProgramAsset(createAssetDto, req.user.role);
  }

  @ApiOperation({ summary: 'Create or update lesson asset' })
  @Roles('ADMIN', 'EDITOR')
  @Post('lessons')
  createLessonAsset(@Body() createAssetDto: any, @Request() req) {
    return this.assetsService.createLessonAsset(createAssetDto, req.user.role);
  }

  @ApiOperation({ summary: 'Delete program asset' })
  @Roles('ADMIN', 'EDITOR')
  @Delete('programs/:id')
  deleteProgramAsset(@Param('id') id: string, @Request() req) {
    return this.assetsService.deleteProgramAsset(id, req.user.role);
  }

  @ApiOperation({ summary: 'Delete lesson asset' })
  @Roles('ADMIN', 'EDITOR')
  @Delete('lessons/:id')
  deleteLessonAsset(@Param('id') id: string, @Request() req) {
    return this.assetsService.deleteLessonAsset(id, req.user.role);
  }
}