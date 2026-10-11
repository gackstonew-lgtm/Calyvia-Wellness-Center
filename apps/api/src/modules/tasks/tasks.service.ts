import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { TaskPriority, TaskStatus } from '@calyvia/shared';

export interface CreateTaskDto {
  title: string;
  description?: string;
  priority?: TaskPriority;
  dueDate: string;
  assignedToId: string;
}

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async createTask(createdById: string, dto: CreateTaskDto) {
    if (!dto.title || !dto.dueDate || !dto.assignedToId) {
      throw new BadRequestException('Task title, due date, and assigned staff member are required.');
    }

    try {
      if (this.prisma && this.prisma.staffTask) {
        return await this.prisma.staffTask.create({
          data: {
            title: dto.title.trim(),
            description: dto.description?.trim() || dto.title.trim(),
            priority: dto.priority || TaskPriority.MEDIUM,
            status: TaskStatus.PENDING,
            dueDate: new Date(dto.dueDate),
            assignedToId: dto.assignedToId,
            createdById: createdById || dto.assignedToId,
          },
        });
      }
      throw new Error('Database connection unavailable');
    } catch (err: any) {
      throw new BadRequestException(`Failed to create task: ${err.message || 'Database error'}`);
    }
  }

  async getTasks(status?: string) {
    try {
      if (this.prisma && this.prisma.staffTask) {
        return await this.prisma.staffTask.findMany({
          where: status ? { status: status as any } : {},
          orderBy: { dueDate: 'asc' },
        });
      }
    } catch (err) {
      console.warn('Tasks fetch error:', err);
    }
    return [];
  }
}
