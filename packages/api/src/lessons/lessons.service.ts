import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

type UserRole = 'ADMIN' | 'EDITOR' | 'VIEWER';
type ContentStatus = 'DRAFT' | 'SCHEDULED' | 'PUBLISHED' | 'ARCHIVED';
type ContentType = 'VIDEO' | 'ARTICLE';

@Injectable()
export class LessonsService {
  constructor(private prisma: PrismaService) {}

  async findAll(termId?: string) {
    const where = termId ? { termId } : {};
    
    return this.prisma.lesson.findMany({
      where,
      include: {
        term: {
          include: {
            program: true,
          },
        },
        assets: true,
      },
      orderBy: [
        { term: { termNumber: 'asc' } },
        { lessonNumber: 'asc' },
      ],
    });
  }

  async findOne(id: string) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id },
      include: {
        term: {
          include: {
            program: true,
          },
        },
        assets: true,
      },
    });

    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    return lesson;
  }

  async create(data: any, userRole: UserRole) {
    if (userRole === 'VIEWER') {
      throw new BadRequestException('Insufficient permissions');
    }

    // Validate content constraints
    this.validateLessonData(data);

    return this.prisma.lesson.create({
      data: {
        ...data,
        status: 'DRAFT',
      },
      include: {
        term: {
          include: {
            program: true,
          },
        },
        assets: true,
      },
    });
  }

  async update(id: string, data: any, userRole: UserRole) {
    if (userRole === 'VIEWER') {
      throw new BadRequestException('Insufficient permissions');
    }

    const lesson = await this.findOne(id);
    
    // Validate content constraints
    if (data.contentType || data.durationMs || data.contentLanguagePrimary || data.contentLanguagesAvailable) {
      this.validateLessonData({ ...lesson, ...data });
    }

    return this.prisma.lesson.update({
      where: { id },
      data,
      include: {
        term: {
          include: {
            program: true,
          },
        },
        assets: true,
      },
    });
  }

  async publish(id: string, userRole: UserRole) {
    if (userRole === 'VIEWER') {
      throw new BadRequestException('Insufficient permissions');
    }

    const lesson = await this.findOne(id);
    
    // Validate publishing requirements
    await this.validatePublishing(id);

    return this.prisma.lesson.update({
      where: { id },
      data: {
        status: 'PUBLISHED',
        publishedAt: new Date(),
      },
      include: {
        term: {
          include: {
            program: true,
          },
        },
        assets: true,
      },
    });
  }

  async schedule(id: string, publishAt: Date, userRole: UserRole) {
    if (userRole === 'VIEWER') {
      throw new BadRequestException('Insufficient permissions');
    }

    const lesson = await this.findOne(id);
    
    // Validate publishing requirements
    await this.validatePublishing(id);

    if (publishAt <= new Date()) {
      throw new BadRequestException('Schedule time must be in the future');
    }

    return this.prisma.lesson.update({
      where: { id },
      data: {
        status: 'SCHEDULED',
        publishAt,
      },
      include: {
        term: {
          include: {
            program: true,
          },
        },
        assets: true,
      },
    });
  }

  async archive(id: string, userRole: UserRole) {
    if (userRole === 'VIEWER') {
      throw new BadRequestException('Insufficient permissions');
    }

    const lesson = await this.findOne(id);
    return this.prisma.lesson.update({
      where: { id },
      data: {
        status: 'ARCHIVED',
      },
      include: {
        term: {
          include: {
            program: true,
          },
        },
        assets: true,
      },
    });
  }

  async delete(id: string, userRole: UserRole) {
    if (userRole !== 'ADMIN') {
      throw new BadRequestException('Insufficient permissions');
    }

    const lesson = await this.findOne(id);
    return this.prisma.lesson.delete({ where: { id } });
  }

  private validateLessonData(data: any) {
    // Validate duration for video content
    if (data.contentType === 'VIDEO' && !data.durationMs) {
      throw new BadRequestException('Duration is required for video content');
    }

    // Validate content languages
    if (data.contentLanguagesAvailable && data.contentLanguagePrimary) {
      if (!data.contentLanguagesAvailable.includes(data.contentLanguagePrimary)) {
        throw new BadRequestException('Primary content language must be included in available languages');
      }
    }

    // Validate content URLs contain primary language
    if (data.contentUrlsByLanguage && data.contentLanguagePrimary) {
      if (!data.contentUrlsByLanguage[data.contentLanguagePrimary]) {
        throw new BadRequestException('Content URL must be provided for primary language');
      }
    }
  }

  private async validatePublishing(lessonId: string): Promise<void> {
    const lesson = await this.findOne(lessonId);
    
    // Check required assets for primary content language
    const requiredAssets = await this.prisma.lessonAsset.findMany({
      where: {
        lessonId,
        language: lesson.contentLanguagePrimary,
        variant: { in: ['PORTRAIT', 'LANDSCAPE'] },
        assetType: 'thumbnail',
      },
    });

    if (requiredAssets.length < 2) {
      throw new BadRequestException(
        'Lesson must have both portrait and landscape thumbnails for primary language before publishing'
      );
    }
  }
}