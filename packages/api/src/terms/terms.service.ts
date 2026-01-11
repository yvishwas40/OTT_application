import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

type UserRole = 'ADMIN' | 'EDITOR' | 'VIEWER';

@Injectable()
export class TermsService {
  constructor(private prisma: PrismaService) {}

  async findByProgram(programId: string) {
    return this.prisma.term.findMany({
      where: { programId },
      include: {
        lessons: {
          include: {
            assets: true,
          },
          orderBy: { lessonNumber: 'asc' },
        },
      },
      orderBy: { termNumber: 'asc' },
    });
  }

  async findOne(id: string) {
    const term = await this.prisma.term.findUnique({
      where: { id },
      include: {
        program: true,
        lessons: {
          include: {
            assets: true,
          },
          orderBy: { lessonNumber: 'asc' },
        },
      },
    });

    if (!term) {
      throw new NotFoundException('Term not found');
    }

    return term;
  }

  async create(data: any, userRole: UserRole) {
    if (userRole === 'VIEWER') {
      throw new BadRequestException('Insufficient permissions');
    }

    // Check if program exists
    const program = await this.prisma.program.findUnique({
      where: { id: data.programId },
    });

    if (!program) {
      throw new NotFoundException('Program not found');
    }

    return this.prisma.term.create({
      data,
      include: {
        program: true,
        lessons: true,
      },
    });
  }

  async update(id: string, data: any, userRole: UserRole) {
    if (userRole === 'VIEWER') {
      throw new BadRequestException('Insufficient permissions');
    }

    await this.findOne(id); // Check if exists

    return this.prisma.term.update({
      where: { id },
      data,
      include: {
        program: true,
        lessons: true,
      },
    });
  }

  async delete(id: string, userRole: UserRole) {
    if (userRole !== 'ADMIN') {
      throw new BadRequestException('Insufficient permissions');
    }

    await this.findOne(id); // Check if exists
    return this.prisma.term.delete({ where: { id } });
  }
}