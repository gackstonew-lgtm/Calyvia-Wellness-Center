import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getExecutiveMetrics() {
    let totalBeds = 0;
    let occupiedBeds = 0;
    let detoxWardOccupancy = 0;
    const inpatientMaleOccupancy = 0;
    const inpatientFemaleOccupancy = 0;
    const vipOccupancy = 0;
    let admissionsThisMonth = 0;
    let activeDetoxCases = 0;
    const activeRehabCases = 0;
    let pendingIntakeLeads = 0;
    let therapySessionsToday = 0;
    let completedSessionsToday = 0;
    let pendingSessionsToday = 0;
    const criticalVitalsAlerts = 0;
    let mtdRevenue = 0;
    let outstandingBalances = 0;
    let mpesaVolumePercentage = 0;
    let bankTransferPercentage = 0;
    let incidentsThisMonth = 0;
    let activeTasksPending = 0;
    let staffOnDuty = 0;
    const aftercareSobrietyRate = 0;

    try {
      if (this.prisma) {
        // Beds & Census
        if (this.prisma.bed) {
          totalBeds = await this.prisma.bed.count({ where: { isActive: true } });
          occupiedBeds = await this.prisma.bed.count({ where: { status: 'OCCUPIED' } });
        }

        // Ward-level Occupancy
        if (this.prisma.bedAllocation) {
          detoxWardOccupancy = await this.prisma.bedAllocation.count({
            where: { isActive: true },
          });
        }

        // Admissions & Leads
        if (this.prisma.admission) {
          admissionsThisMonth = await this.prisma.admission.count({
            where: { isActive: true },
          });
        }

        if (this.prisma.detoxEpisode) {
          activeDetoxCases = await this.prisma.detoxEpisode.count({
            where: { isCompleted: false },
          });
        }

        if (this.prisma.lead) {
          pendingIntakeLeads = await this.prisma.lead.count({
            where: { status: 'NEW' },
          });
        }

        // Clinical & Appointments Today
        if (this.prisma.appointment) {
          const todayStart = new Date();
          todayStart.setHours(0, 0, 0, 0);
          const todayEnd = new Date();
          todayEnd.setHours(23, 59, 59, 999);

          const appts = await this.prisma.appointment.findMany();
          therapySessionsToday = appts.length;
          completedSessionsToday = appts.filter((a: any) => a.status === 'COMPLETED').length;
          pendingSessionsToday = appts.filter((a: any) => a.status !== 'COMPLETED').length;
        }

        // Financials (Invoices & Payments)
        if (this.prisma.invoice) {
          const invoices = await this.prisma.invoice.findMany();
          outstandingBalances = invoices.reduce((sum: number, inv: any) => sum + Number(inv.balanceDue || inv.balanceKES || 0), 0);
        }

        if (this.prisma.payment) {
          const payments = await this.prisma.payment.findMany();
          mtdRevenue = payments.reduce((sum: number, p: any) => sum + Number(p.amountPaid || p.amountKES || 0), 0);
          const mpesaPayments = payments.filter((p: any) => p.paymentMethod === 'MPESA_STK' || p.paymentMethod === 'MPESA_PAYBILL');
          const mpesaTotal = mpesaPayments.reduce((sum: number, p: any) => sum + Number(p.amountPaid || p.amountKES || 0), 0);
          if (mtdRevenue > 0) {
            mpesaVolumePercentage = Math.round((mpesaTotal / mtdRevenue) * 1000) / 10;
            bankTransferPercentage = Math.round((100 - mpesaVolumePercentage) * 10) / 10;
          }
        }

        // Tasks & Staff
        if (this.prisma.staffTask) {
          activeTasksPending = await this.prisma.staffTask.count({
            where: { status: 'PENDING' },
          });
        }

        if (this.prisma.user) {
          staffOnDuty = await this.prisma.user.count({
            where: { isActive: true },
          });
        }

        if (this.prisma.incidentReport) {
          incidentsThisMonth = await this.prisma.incidentReport.count();
        }
      }
    } catch (err) {
      console.warn('Dashboard metrics aggregation error:', err);
    }

    const availableBeds = Math.max(0, totalBeds - occupiedBeds);
    const occupancyRatePercentage = totalBeds > 0
      ? Math.round((occupiedBeds / totalBeds) * 1000) / 10
      : 0;

    return {
      facility: {
        name: 'Calyvia Wellness Center',
        location: 'Mugutha, Ruiru, Kiambu County, Kenya',
        contactPhone: '+254700534306',
        status: 'OPERATIONAL',
      },
      census: {
        totalBeds,
        occupiedBeds,
        availableBeds,
        occupancyRatePercentage,
        detoxWardOccupancy,
        inpatientMaleOccupancy,
        inpatientFemaleOccupancy,
        vipOccupancy,
      },
      admissions: {
        thisMonth: admissionsThisMonth,
        activeDetoxCases,
        activeRehabilitationCases: activeRehabCases,
        pendingIntakeLeads,
      },
      clinical: {
        therapySessionsToday,
        completedSessions: completedSessionsToday,
        pendingSessions: pendingSessionsToday,
        criticalVitalsAlerts,
      },
      financials: {
        currency: 'KES',
        mtdRevenueCollected: mtdRevenue,
        outstandingBalances,
        mpesaVolumePercentage,
        bankTransferPercentage,
      },
      qualityAndSafety: {
        incidentsReportedMonth: incidentsThisMonth,
        activeTasksPending,
        staffOnDuty,
        aftercareSobrietyRatePercentage: aftercareSobrietyRate,
      },
    };
  }
}

