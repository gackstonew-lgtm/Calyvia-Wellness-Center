import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async generateFinancialReport(month?: string) {
    let totalCollected = 0;
    let totalOutstanding = 0;

    try {
      if (this.prisma) {
        if (this.prisma.payment) {
          const payments = await this.prisma.payment.findMany();
          totalCollected = payments.reduce((sum: number, p: any) => sum + Number(p.amountPaid || p.amountKES || 0), 0);
        }
        if (this.prisma.invoice) {
          const invoices = await this.prisma.invoice.findMany();
          totalOutstanding = invoices.reduce((sum: number, inv: any) => sum + Number(inv.balanceDue || inv.balanceKES || 0), 0);
        }
      }
    } catch (err) {
      console.warn('Financial report aggregation error:', err);
    }

    return {
      reportTitle: `Calyvia Wellness Center - Financial Summary (${month || 'Current Month'})`,
      currency: 'KES',
      generatedAt: new Date().toISOString(),
      breakdown: [
        { category: 'Medical Detoxification Packages', amountKES: 0, percentage: 0 },
        { category: 'Inpatient 30/60/90 Day Rehabilitation', amountKES: 0, percentage: 0 },
        { category: 'Psychiatric Reviews & Medical Care', amountKES: 0, percentage: 0 },
        { category: 'Family & Outpatient Psychotherapy', amountKES: 0, percentage: 0 },
      ],
      totalCollectedKES: totalCollected,
      totalOutstandingKES: totalOutstanding,
    };
  }

  async generateClinicalOutcomesReport() {
    let completedEpisodes = 0;
    let totalDischarges = 0;

    try {
      if (this.prisma) {
        if (this.prisma.detoxEpisode) {
          completedEpisodes = await this.prisma.detoxEpisode.count({ where: { isCompleted: true } });
        }
        if (this.prisma.dischargeRecord) {
          totalDischarges = await this.prisma.dischargeRecord.count();
        }
      }
    } catch (err) {
      console.warn('Clinical outcomes aggregation error:', err);
    }

    return {
      reportTitle: 'Clinical Rehabilitation & Detoxification Outcomes',
      reportingFacility: 'Calyvia Wellness Center (Ruiru, Kenya)',
      generatedAt: new Date().toISOString(),
      metrics: {
        totalDetoxEpisodesCompleted: completedEpisodes,
        totalDischargesCompleted: totalDischarges,
        averageDetoxDurationDays: 0,
        uncomplicatedDetoxSuccessRate: 0,
        averageCIWAScoreReduction: completedEpisodes > 0 ? 'Evaluated on completion' : 'No records yet',
        rehabProgramGraduationRate: 0,
        aftercareSobrietyRetention90Days: 0,
      },
    };
  }
}
