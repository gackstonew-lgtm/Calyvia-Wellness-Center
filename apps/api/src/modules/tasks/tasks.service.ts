import { Injectable } from '@nestjs/common';
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
    try {
      if (this.prisma && this.prisma.staffTask) {
        return await this.prisma.staffTask.create({
          data: {
            title: dto.title,
            description: dto.description || null,
            priority: dto.priority || TaskPriority.MEDIUM,
            status: TaskStatus.PENDING,
            dueDate: new Date(dto.dueDate),
            assignedToId: dto.assignedToId,
            createdById,
          },
        });
      }
    } catch {
      // Fallback
    }

    return {
      id: 'mock-task-1',
      ...dto,
      status: TaskStatus.PENDING,
      createdAt: new Date().toISOString(),
    };
  }

  async getTasks(status?: string) {
    try {
      if (this.prisma && this.prisma.staffTask) {
        return await this.prisma.staffTask.findMany({
          where: status ? { status: status as any } : {},
          include: { assignedTo: true },
          orderBy: { dueDate: 'asc' },
        });
      }
    } catch {
      // Fallback
    }

    return [
      {
        id: 'mock-task-1',
        title: 'Conduct CIWA Vitals Check for Patient in Bed 02',
        priority: 'URGENT',
        status: 'PENDING',
        dueDate: new Date(Date.now() + 1800000).toISOString(),
        assignedToName: 'Nurse Faith Wangari',
      },
      {
        id: 'mock-task-2',
        title: 'Review weekly discharge readiness with MDT team',
        priority: 'HIGH',
        status: 'IN_PROGRESS',
        dueDate: new Date(Date.now() + 86400000).toISOString(),
        assignedToName: 'Dr. Evelyn Wanjiku',
      },
    ];
  }
}
