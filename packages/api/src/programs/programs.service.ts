import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

type UserRole = 'ADMIN' | 'EDITOR' | 'VIEWER';
type ContentStatus = 'DRAFT' | 'SCHEDULED' | 'PUBLISHED' | 'ARCHIVED';

@Injectable()
export class ProgramsService {
  constructor(private prisma: PrismaService) {}

  async findAll(filters?: {
    status?: ContentStatus;
    language?: string;
    topicId?: string;
  }) {
    const where: any = {};
    
    if (filters?.status) {
      where.status = filters.status;
    }
    
    if (filters?.language) {
      where.languagesAvailable = {
        has: filters.language,
      };
    }

    if (filters?.topicId) {
      where.topics = {
        some: {
          topicId: filters.topicId,
        },
      };
    }

    return this.prisma.program.findMany({
      where,
      include: {
        topics: {
          include: {
            topic: true,
          },
        },
        assets: true,
        terms: {
          include: {
            lessons: {
              select: {
                id: true,
                status: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const program = await this.prisma.program.findUnique({
      where: { id },
      include: {
        topics: {
          include: {
            topic: true,
          },
        },
        assets: true,
        terms: {
          include: {
            lessons: {
              include: {
                assets: true,
              },
            },
          },
          orderBy: { termNumber: 'asc' },
        },
      },
    });

    if (!program) {
      throw new NotFoundException('Program not found');
    }

    return program;
  }

  async create(data: any, userRole: UserRole) {
    if (userRole === 'VIEWER') {
      throw new BadRequestException('Insufficient permissions');
    }

    // Validate that primary language is in available languages
    if (!data.languagesAvailable?.includes(data.languagePrimary)) {
      throw new BadRequestException('Primary language must be included in available languages');
    }

    return this.prisma.program.create({
      data: {
        ...data,
        status: 'DRAFT',
      },
      include: {
        topics: {
          include: {
            topic: true,
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

    const program = await this.findOne(id);

    // Validate language constraints
    if (data.languagesAvailable && data.languagePrimary) {
      if (!data.languagesAvailable.includes(data.languagePrimary)) {
        throw new BadRequestException('Primary language must be included in available languages');
      }
    }

    return this.prisma.program.update({
      where: { id },
      data,
      include: {
        topics: {
          include: {
            topic: true,
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

    const program = await this.findOne(id);
    return this.prisma.program.delete({ where: { id } });
  }

  async validatePublishing(programId: string): Promise<boolean> {
    const program = await this.findOne(programId);
    
    // Check if program has required assets for primary language
    const requiredAssets = await this.prisma.programAsset.findMany({
      where: {
        programId,
        language: program.languagePrimary,
        variant: { in: ['PORTRAIT', 'LANDSCAPE'] },
        assetType: 'poster',
      },
    });

    return requiredAssets.length >= 2; // Both portrait and landscape
  }

  async autoPublish(programId: string) {
    const program = await this.findOne(programId);
    
    // Check if program has any published lessons
    const publishedLessons = await this.prisma.lesson.count({
      where: {
        term: {
          programId,
        },
        status: 'PUBLISHED',
      },
    });

    if (publishedLessons > 0 && program.status !== 'PUBLISHED') {
      await this.prisma.program.update({
        where: { id: programId },
        data: {
          status: 'PUBLISHED',
          publishedAt: program.publishedAt || new Date(),
        },
      });
    }
  }
}