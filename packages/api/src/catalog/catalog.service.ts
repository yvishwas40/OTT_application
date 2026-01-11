import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

type ContentStatus = 'DRAFT' | 'SCHEDULED' | 'PUBLISHED' | 'ARCHIVED';

@Injectable()
export class CatalogService {
  constructor(private prisma: PrismaService) {}

  async getPrograms(cursor?: string, limit = 20) {
    const where: any = { status: 'PUBLISHED' };
    
    const programs = await this.prisma.program.findMany({
      where,
      take: limit + 1, // Take one extra to determine if there are more
      ...(cursor && { 
        cursor: { id: cursor },
        skip: 1, // Skip the cursor
      }),
      include: {
        topics: {
          include: {
            topic: true,
          },
        },
        assets: {
          where: {
            assetType: 'poster',
          },
        },
        terms: {
          include: {
            lessons: {
              where: {
                status: 'PUBLISHED',
              },
              select: {
                id: true,
                title: true,
                contentType: true,
                durationMs: true,
                isPaid: true,
              },
            },
          },
        },
      },
      orderBy: { publishedAt: 'desc' },
    });

    const hasNextPage = programs.length > limit;
    const items = hasNextPage ? programs.slice(0, -1) : programs;
    const nextCursor = hasNextPage ? items[items.length - 1].id : null;

    return {
      items,
      nextCursor,
      hasNextPage,
    };
  }

  async getProgram(id: string) {
    return this.prisma.program.findFirst({
      where: {
        id,
        status: 'PUBLISHED',
      },
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
              where: {
                status: 'PUBLISHED',
              },
              include: {
                assets: true,
              },
            },
          },
          orderBy: { termNumber: 'asc' },
        },
      },
    });
  }

  async getLesson(id: string) {
    return this.prisma.lesson.findFirst({
      where: {
        id,
        status: 'PUBLISHED',
      },
      include: {
        term: {
          include: {
            program: {
              select: {
                id: true,
                title: true,
                status: true,
              },
            },
          },
        },
        assets: true,
      },
    });
  }
}