import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getExecutiveMetrics() {
    return {
      facility: {
        name: 'Calyvia Wellness Center',
        location: 'Mugutha, Ruiru, Kiambu County, Kenya',
        contactPhone: '+254700534306',
        status: 'OPERATIONAL',
      },
      census: {
        totalBeds: 32,
        occupiedBeds: 28,
        availableBeds: 4,
        occupancyRatePercentage: 87.5,
        detoxWardOccupancy: 6,
        inpatientMaleOccupancy: 12,
        inpatientFemaleOccupancy: 8,
        vipOccupancy: 2,
      },
      admissions: {
        thisMonth: 19,
        activeDetoxCases: 6,
        activeRehabilitationCases: 22,
        pendingIntakeLeads: 5,
      },
      clinical: {
        therapySessionsToday: 14,
        completedSessions: 8,
        pendingSessions: 6,
        criticalVitalsAlerts: 1,
      },
      financials: {
        currency: 'KES',
        mtdRevenueCollected: 3840000.0,
        outstandingBalances: 620000.0,
        mpesaVolumePercentage: 68.4,
        bankTransferPercentage: 31.6,
      },
      qualityAndSafety: {
        incidentsReportedMonth: 1,
        activeTasksPending: 7,
        staffOnDuty: 14,
        aftercareSobrietyRatePercentage: 92.4,
      },
    };
  }
}
