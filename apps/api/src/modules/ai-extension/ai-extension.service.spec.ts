import { Test, TestingModule } from '@nestjs/testing';
import { AiExtensionService } from './ai-extension.service';
import { AiInstitutionalToolsService } from './ai-institutional-tools.service';
import { AuditService } from '../audit/audit.service';
import { UserRole } from '@calyvia/shared';

describe('AiExtensionService (Institutional Intelligence & Clinical Safety)', () => {
  let service: AiExtensionService;
  let mockToolsService: any;
  let mockAuditService: any;

  beforeEach(async () => {
    mockToolsService = {
      getDashboardSummary: jest.fn().mockResolvedValue({
        toolName: 'get_dashboard_summary',
        data: {
          facility: { name: 'Calyvia Wellness Center', status: 'OPERATIONAL', location: 'Ruiru' },
          census: { occupiedBeds: 28, totalBeds: 32, occupancyRatePercentage: 87.5, detoxWardOccupancy: 6 },
          clinical: { therapySessionsToday: 14, criticalVitalsAlerts: 1 },
          financials: { mtdRevenueCollected: 3840000.0 },
          qualityAndSafety: { staffOnDuty: 14 },
        },
        summary: 'Executive summary text',
      }),
      getAppointmentsSummary: jest.fn().mockResolvedValue({
        toolName: 'get_appointments_summary',
        data: [],
        summary: 'Appointments text',
      }),
      getPatientStatistics: jest.fn().mockResolvedValue({
        toolName: 'get_patient_statistics',
        data: { totalActiveInpatients: 28, totalCapacity: 32, occupancyRate: '87.5%' },
        summary: 'Census text',
      }),
      getStaffWorkload: jest.fn().mockResolvedValue({
        toolName: 'get_staff_workload',
        data: [],
        summary: 'Staff text',
      }),
      getBillingSummary: jest.fn().mockResolvedValue({
        toolName: 'get_billing_summary',
        data: { mtdRevenueCollectedKES: 3840000, darajaMpesaShare: '68.4%' },
        summary: 'Billing text',
      }),
      getApplicationHelp: jest.fn().mockReturnValue({
        toolName: 'get_application_help',
        data: [],
        summary: 'Help text',
      }),
      getInstitutionalProtocols: jest.fn().mockReturnValue({
        toolName: 'get_institutional_protocols',
        data: {},
        summary: 'Protocol text',
      }),
    };

    mockAuditService = {
      logAction: jest.fn().mockResolvedValue(null),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiExtensionService,
        { provide: AiInstitutionalToolsService, useValue: mockToolsService },
        { provide: AuditService, useValue: mockAuditService },
      ],
    }).compile();

    service = module.get<AiExtensionService>(AiExtensionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should intercept clinical prescription requests with safety guardrail', async () => {
    const res = await service.processChat(
      { message: 'Please prescribe 20mg Diazepam for patient John Kamau' },
      { role: UserRole.NURSE, fullName: 'Nurse Wangari' },
    );

    expect(res.success).toBe(true);
    expect(res.reply).toContain('Clinical Safety Boundary');
    expect(res.reply).toContain('cannot diagnose individual patients or prescribe medications');
    expect(res.meta?.toolsExecuted).toContain('clinical_safety_guard');
  });

  it('should answer operational summary requests using live dashboard tool', async () => {
    const res = await service.processChat(
      { message: 'Give me today\'s operational summary' },
      { role: UserRole.SUPER_ADMIN, fullName: 'Dr. Antony Baraka' },
    );

    expect(res.success).toBe(true);
    expect(res.reply).toContain('Operational Summary');
    expect(res.reply).toContain('28 / 32 Beds');
    expect(mockToolsService.getDashboardSummary).toHaveBeenCalled();
    expect(mockAuditService.logAction).toHaveBeenCalled();
  });

  it('should handle appointment queries accurately', async () => {
    const res = await service.processChat(
      { message: 'What appointments are scheduled for today?' },
      { role: UserRole.DOCTOR_PSYCHIATRIST, fullName: 'Dr. Evelyn Wanjiku' },
    );

    expect(res.success).toBe(true);
    expect(res.reply).toContain('Schedule');
    expect(mockToolsService.getAppointmentsSummary).toHaveBeenCalled();
  });
});
