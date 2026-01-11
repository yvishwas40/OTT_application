import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

type UserRole = 'ADMIN' | 'EDITOR' | 'VIEWER';
type AssetVariant = 'PORTRAIT' | 'LANDSCAPE' | 'SQUARE' | 'BANNER';

@Injectable()
export class AssetsService {
  constructor(private prisma: PrismaService) {}

  async createProgramAsset(data: {
    programId: string;
    language: string;
    variant: AssetVariant;
    assetType: string;
    url: string;
  }, userRole: UserRole) {
    if (userRole === 'VIEWER') {
      throw new BadRequestException('Insufficient permissions');
    }

    return this.prisma.programAsset.upsert({
      where: {
        programId_language_variant_assetType: {
          programId: data.programId,
          language: data.language,
          variant: data.variant,
          assetType: data.assetType,
        },
      },
      update: {
        url: data.url,
      },
      create: data,
    });
  }

  async createLessonAsset(data: {
    lessonId: string;
    language: string;
    variant: AssetVariant;
    assetType: string;
    url: string;
  }, userRole: UserRole) {
    if (userRole === 'VIEWER') {
      throw new BadRequestException('Insufficient permissions');
    }

    return this.prisma.lessonAsset.upsert({
      where: {
        lessonId_language_variant_assetType: {
          lessonId: data.lessonId,
          language: data.language,
          variant: data.variant,
          assetType: data.assetType,
        },
      },
      update: {
        url: data.url,
      },
      create: data,
    });
  }

  async deleteProgramAsset(id: string, userRole: UserRole) {
    if (userRole === 'VIEWER') {
      throw new BadRequestException('Insufficient permissions');
    }

    return this.prisma.programAsset.delete({ where: { id } });
  }

  async deleteLessonAsset(id: string, userRole: UserRole) {
    if (userRole === 'VIEWER') {
      throw new BadRequestException('Insufficient permissions');
    }

    return this.prisma.lessonAsset.delete({ where: { id } });
  }
}