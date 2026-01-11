import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TopicsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.topic.findMany({
      include: {
        programs: {
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
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const topic = await this.prisma.topic.findUnique({
      where: { id },
      include: {
        programs: {
          include: {
            program: true,
          },
        },
      },
    });

    if (!topic) {
      throw new NotFoundException('Topic not found');
    }

    return topic;
  }

  async create(data: { name: string }) {
    try {
      return await this.prisma.topic.create({
        data,
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Topic name already exists');
      }
      throw error;
    }
  }

  async update(id: string, data: { name: string }) {
    await this.findOne(id); // Check if exists
    
    try {
      return await this.prisma.topic.update({
        where: { id },
        data,
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Topic name already exists');
      }
      throw error;
    }
  }

  async delete(id: string) {
    await this.findOne(id); // Check if exists
    return this.prisma.topic.delete({ where: { id } });
  }
}