import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async generateFinancialReport(month?: string) {
    return {
      reportTitle: `Calyvia Wellness Center - Financial Summary (${month || 'Current Month'})`,
      currency: 'KES',
      generatedAt: new Date().toISOString(),
      breakdown: [
        { category: 'Medical Detoxification Packages', amountKES: 1440000, percentage: 37.5 },
        { category: 'Inpatient 30/60/90 Day Rehabilitation', amountKES: 1870000, percentage: 48.7 },
        { category: 'Psychiatric Reviews & Medical Care', amountKES: 310000, percentage: 8.1 },
        { category: 'Family & Outpatient Psychotherapy', amountKES: 220000, percentage: 5.7 },
      ],
      totalCollectedKES: 3840000,
      totalOutstandingKES: 620000,
    };
  }

  async generateClinicalOutcomesReport() {
    return {
      reportTitle: 'Clinical Rehabilitation & Detoxification Outcomes',
      reportingFacility: 'Calyvia Wellness Center (Ruiru, Kenya)',
      generatedAt: new Date().toISOString(),
      metrics: {
        totalDetoxEpisodesCompleted: 48,
        averageDetoxDurationDays: 6.2,
        uncomplicatedDetoxSuccessRate: 97.9,
        averageCIWAScoreReduction: '18.4 to 1.8 in 72 hours',
        rehabProgramGraduationRate: 91.2,
        aftercareSobrietyRetention90Days: 88.5,
      },
    };
  }
}
