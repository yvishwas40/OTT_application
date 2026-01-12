import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

type UserRole = 'ADMIN' | 'EDITOR' | 'VIEWER';
type ContentStatus = 'DRAFT' | 'SCHEDULED' | 'PUBLISHED' | 'ARCHIVED';

@Injectable()
export class ProgramsService {
  constructor(private prisma: PrismaService) {}

  /* ============================================================
     FIND ALL PROGRAMS (CMS LIST)
  ============================================================ */
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
          include: { topic: true },
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

  /* ============================================================
     FIND ONE PROGRAM (DETAIL PAGE)
  ============================================================ */
  async findOne(id: string) {
    const program = await this.prisma.program.findUnique({
      where: { id },
      include: {
        topics: {
          include: { topic: true },
        },
        assets: true,
        terms: {
          orderBy: { termNumber: 'asc' },
          include: {
            lessons: {
              include: {
                assets: true,
              },
            },
          },
        },
      },
    });

    if (!program) {
      throw new NotFoundException('Program not found');
    }

    return program;
  }

  /* ============================================================
     CREATE PROGRAM
  ============================================================ */
  async create(data: any, userRole: UserRole) {
    if (userRole === 'VIEWER') {
      throw new BadRequestException('Insufficient permissions');
    }

    if (!data.languagesAvailable?.includes(data.languagePrimary)) {
      throw new BadRequestException(
        'Primary language must be included in available languages',
      );
    }

    const { topicIds, ...programData } = data;

    return this.prisma.program.create({
      data: {
        ...programData,
        status: 'DRAFT',

        topics: Array.isArray(topicIds)
          ? {
              create: topicIds.map((topicId: string) => ({
                topic: {
                  connect: { id: topicId },
                },
              })),
            }
          : undefined,
      },
      include: {
        topics: { include: { topic: true } },
        assets: true,
      },
    });
  }

  /* ============================================================
     UPDATE PROGRAM  ⭐ FIXED HERE ⭐
  ============================================================ */
  async update(id: string, data: any, userRole: UserRole) {
    if (userRole === 'VIEWER') {
      throw new BadRequestException('Insufficient permissions');
    }

    await this.findOne(id);

    if (data.languagesAvailable && data.languagePrimary) {
      if (!data.languagesAvailable.includes(data.languagePrimary)) {
        throw new BadRequestException(
          'Primary language must be included in available languages',
        );
      }
    }

    const { topicIds, ...programData } = data;

    return this.prisma.program.update({
      where: { id },
      data: {
        ...programData,
        topics: topicIds
          ? {
              deleteMany: {}, // remove old relations
              create: topicIds.map((topicId: string) => ({
                topic: { connect: { id: topicId } },
              })),
            }
          : undefined,
      },
      include: {
        topics: {
          include: { topic: true },
        },
        assets: true,
      },
    });
  }

  /* ============================================================
     DELETE PROGRAM (ADMIN ONLY)
  ============================================================ */
  async delete(id: string, userRole: UserRole) {
    if (userRole !== 'ADMIN') {
      throw new BadRequestException('Insufficient permissions');
    }

    await this.findOne(id);

    return this.prisma.program.delete({
      where: { id },
    });
  }

  /* ============================================================
     VALIDATE PUBLISHING (ASSETS CHECK)
  ============================================================ */
  async validatePublishing(programId: string): Promise<boolean> {
    const program = await this.findOne(programId);

    const requiredAssets = await this.prisma.programAsset.findMany({
      where: {
        programId,
        language: program.languagePrimary,
        variant: { in: ['PORTRAIT', 'LANDSCAPE'] },
        assetType: 'poster',
      },
    });

    return requiredAssets.length >= 2;
  }

  /* ============================================================
     AUTO-PUBLISH PROGRAM (FROM WORKER)
  ============================================================ */
  async autoPublish(programId: string) {
    const program = await this.findOne(programId);

    const publishedLessons = await this.prisma.lesson.count({
      where: {
        term: { programId },
        status: 'PUBLISHED',
      },
    });

    if (publishedLessons > 0 && program.status !== 'PUBLISHED') {
      await this.prisma.program.update({
        where: { id: programId },
        data: {
          status: 'PUBLISHED',
          publishedAt: program.publishedAt ?? new Date(),
        },
      });
    }
  }
}
