import { Test, TestingModule } from '@nestjs/testing';
import { DashboardService } from './dashboard.service';
import { PrismaService } from '../../database/prisma.service';

describe('DashboardService (Executive KPIs & Census)', () => {
  let service: DashboardService;
  let mockPrisma: any;

  beforeEach(async () => {
    mockPrisma = {
      bed: { findMany: jest.fn() },
      patient: { findMany: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return executive metrics with correct census ratios', async () => {
    const metrics = await service.getExecutiveMetrics();

    expect(metrics).toBeDefined();
    expect(metrics.facility.name).toBe('Calyvia Wellness Center');
    expect(metrics.facility.status).toBe('OPERATIONAL');

    // Census assertions
    expect(metrics.census.totalBeds).toBe(32);
    expect(metrics.census.occupiedBeds).toBe(28);
    expect(metrics.census.availableBeds).toBe(4);
    expect(metrics.census.occupancyRatePercentage).toBe(87.5);

    // Sum of ward allocations must equal occupied beds
    const wardSum =
      metrics.census.detoxWardOccupancy +
      metrics.census.inpatientMaleOccupancy +
      metrics.census.inpatientFemaleOccupancy +
      metrics.census.vipOccupancy;
    expect(wardSum).toBe(28);

    // Financial calculations
    expect(metrics.financials.currency).toBe('KES');
    expect(metrics.financials.mtdRevenueCollected).toBe(3840000.0);
    expect(metrics.financials.mpesaVolumePercentage + metrics.financials.bankTransferPercentage).toBeCloseTo(100.0);
  });
});
