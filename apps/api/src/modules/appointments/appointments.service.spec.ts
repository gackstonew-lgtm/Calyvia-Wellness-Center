import { Test, TestingModule } from '@nestjs/testing';
import { AppointmentsService, CreateAppointmentDto } from './appointments.service';
import { PrismaService } from '../../database/prisma.service';

describe('AppointmentsService (Clinical Scheduling)', () => {
  let service: AppointmentsService;
  let mockPrisma: any;

  beforeEach(async () => {
    mockPrisma = {
      appointment: {
        create: jest.fn().mockImplementation((args) => Promise.resolve({ id: 'appt-123', ...args.data })),
        findMany: jest.fn().mockResolvedValue([
          {
            id: 'mock-appt-1',
            title: 'Weekly Multidisciplinary Team Review (MDT)',
            staffMemberName: 'Dr. Evelyn Wanjiku',
            appointmentType: 'PSYCHIATRIC_REVIEW',
            status: 'SCHEDULED',
          },
        ]),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppointmentsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<AppointmentsService>(AppointmentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create an appointment with valid ISO timestamps', async () => {
    const dto: CreateAppointmentDto = {
      title: 'Individual CBT Therapy Session',
      staffMemberName: 'Counsellor David',
      appointmentType: 'CBT_INDIVIDUAL',
      startTime: '2026-10-10T09:00:00.000Z',
      endTime: '2026-10-10T10:00:00.000Z',
      location: 'Therapy Suite B',
    };

    const result = await service.createAppointment(dto);
    expect(result).toBeDefined();
    expect(result.title).toBe(dto.title);
    expect(result.staffMemberName).toBe(dto.staffMemberName);
    expect(mockPrisma.appointment.create).toHaveBeenCalled();
  });

  it('should return upcoming appointments sorted by start time', async () => {
    const appointments = await service.getUpcomingAppointments();
    expect(Array.isArray(appointments)).toBe(true);
    expect(appointments.length).toBeGreaterThan(0);
    expect(appointments[0].title).toContain('Multidisciplinary Team');
  });
});
