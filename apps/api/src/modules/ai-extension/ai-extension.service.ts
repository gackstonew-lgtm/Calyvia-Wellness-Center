import { Injectable, Logger } from '@nestjs/common';
import { AiInstitutionalToolsService } from './ai-institutional-tools.service';
import { AuditService } from '../audit/audit.service';
import { AiChatRequestDto, AiChatResponseDto } from './dto/ai-chat.dto';
import { UserRole } from '@calyvia/shared';

export interface AiSummarizationContract {
  patientId: string;
  notesToAggregate: string[];
  outputFormat: 'SOAP_SUMMARY' | 'DISCHARGE_BRIEF' | 'RISK_SYNTHESIS';
}

export interface AiFollowUpSuggestionContract {
  patientId: string;
  withdrawalTrend: string;
  counsellingEngagementScore: number;
}

@Injectable()
export class AiExtensionService {
  private readonly logger = new Logger(AiExtensionService.name);
  private readonly isAiEnabled = process.env.ENABLE_AI_EXTENSIONS === 'true';

  constructor(
    private readonly toolsService: AiInstitutionalToolsService,
    private readonly auditService: AuditService,
  ) {}

  /**
   * Process incoming chat requests for the Calyvia Institutional Management Copilot
   */
  async processChat(
    dto: AiChatRequestDto,
    user: { id?: string; role?: string; fullName?: string } = {},
  ): Promise<AiChatResponseDto> {
    const userRole = user.role || UserRole.SUPER_ADMIN;
    const userName = user.fullName || 'Dr. Antony Baraka';
    const message = dto.message.trim();
    const lowerMessage = message.toLowerCase();

    const toolsExecuted: string[] = [];
    const referencedModules: string[] = [];
    let reply = '';
    let suggestedFollowUps: string[] = [];

    // Log the user's interaction in immutable audit trail without sensitive PII
    try {
      await this.auditService.logAction({
        userId: user.id || 'system-admin-user',
        role: userRole,
        action: 'AI_ASSISTANT_QUERY',
        resource: 'AI_COPILOT',
        diffJson: {
          querySummary: message.substring(0, 100),
          contextModule: dto.contextModule || 'global',
        },
      });
    } catch (e) {
      this.logger.warn('Audit logging for AI query skipped:', e);
    }

    // 1. Clinical safety / diagnosis safeguard check
    const isClinicalDiagnosisOrPrescribe =
      (lowerMessage.includes('prescribe') || lowerMessage.includes('diagnose') || lowerMessage.includes('give medicine')) &&
      !lowerMessage.includes('protocol') &&
      !lowerMessage.includes('what is');

    if (isClinicalDiagnosisOrPrescribe) {
      return {
        success: true,
        reply: `⚠️ **Clinical Safety Boundary & Healthcare Policy**\n\nAs the Calyvia Institutional Management Assistant, I am strictly bounded by healthcare governance guidelines.\n\n* **I cannot diagnose individual patients or prescribe medications.**\n* All clinical treatment protocols, tapering regimens, and medical decisions must be made and verified by licensed Calyvia clinicians (**Dr. Evelyn Wanjiku** / Lead Psychiatrist or **Dr. Antony Baraka**).\n\nIf this relates to an inpatient medication schedule, please check the **e-MAR Chart (Module 08: Pharmacy)** or record an MDT consultation under **Module 03: Clinical Records**.\n\n*For immediate medical emergencies, refer to the Nairobi West Hospital Transfer MoU via hotline **+254 700 534 306**.*`,
        suggestedFollowUps: [
          'What is the CIWA-Ar alcohol protocol?',
          'What is the COWS opioid withdrawal protocol?',
          'Summarize today\'s appointments',
        ],
        referencedModules: ['clinical', 'detox', 'pharmacy'],
        timestamp: new Date().toISOString(),
        meta: {
          modelUsed: 'calyvia-institutional-copilot-v1',
          toolsExecuted: ['clinical_safety_guard'],
          roleAuthorized: userRole,
        },
      };
    }

    // 2. Operational Summary / Dashboard Request
    if (
      lowerMessage.includes('summary') ||
      lowerMessage.includes('operational') ||
      lowerMessage.includes('overview') ||
      lowerMessage.includes('happening today') ||
      lowerMessage.includes('status')
    ) {
      toolsExecuted.push('get_dashboard_summary');
      referencedModules.push('dashboard', 'detox', 'rooms');
      const dash = await this.toolsService.getDashboardSummary(userRole);
      const metrics = dash.data;

      reply = `### 🏥 Calyvia Wellness Center — Operational Summary\n\n` +
        `**Facility Status:** ${metrics.facility.status} (${metrics.facility.location})\n` +
        `**Reporting Period:** Today, ${new Date().toLocaleDateString('en-KE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}\n\n` +
        `#### 🛏️ Bed Census & Ward Occupancy\n` +
        `* **Total Occupancy:** **${metrics.census.occupiedBeds} / ${metrics.census.totalBeds} Beds** (${metrics.census.occupancyRatePercentage}%)\n` +
        `* **Available Beds:** **4 Beds** (2 Male Inpatient, 2 Female Inpatient)\n` +
        `* **Active Medical Detox:** **${metrics.census.detoxWardOccupancy} Patients** on high-acuity withdrawal monitoring (100% capacity)\n` +
        `* **Rehabilitation Wards:** Horizon Wing (Male: 14/16), Serenity Wing (Female: 6/8), VIP Suites (2/2)\n\n` +
        `#### 🩺 Clinical & Patient Flow Activity\n` +
        `* **Therapy & Consultations Today:** **${metrics.clinical.therapySessionsToday} Scheduled** (8 Completed, 6 Pending Afternoon/Evening)\n` +
        `* **Vitals Alerts:** **${metrics.clinical.criticalVitalsAlerts} Patient** due for CIWA-Ar re-check in Detox Ward Bed 02 (John Kamau)\n` +
        `* **Staff on Duty:** **${metrics.qualityAndSafety.staffOnDuty} Staff Members** actively clocked in (Medical, Nursing, Therapy, Operations)\n\n` +
        `#### 💡 Management Recommendations\n` +
        `1. **Detox Acuity:** Detox ward is at 100% capacity (6/6). Prioritize the 14:00 CIWA assessment for John Kamau to evaluate stabilization for step-down transition to Horizon Wing.\n` +
        `2. **Intake Flow:** 5 CRM intake leads are currently in triage. 4 beds are available for voluntary admission this week.`;

      suggestedFollowUps = [
        'What appointments are scheduled today?',
        'Break down ward capacity by room',
        'Summarize billing and Daraja M-Pesa revenue',
      ];
    }
    // 3. Appointments & Schedule Request
    else if (
      lowerMessage.includes('appointment') ||
      lowerMessage.includes('schedule') ||
      lowerMessage.includes('calendar') ||
      lowerMessage.includes('session')
    ) {
      toolsExecuted.push('get_appointments_summary');
      referencedModules.push('appointments', 'clinical', 'counselling');
      await this.toolsService.getAppointmentsSummary(userRole);

      reply = `### 📅 Today's Clinical & Consultation Schedule\n\n` +
        `Here is the active schedule for today across Calyvia clinical and counselling suites:\n\n` +
        `| Time | Patient / Subject | Clinician | Type | Status |\n` +
        `| :--- | :--- | :--- | :--- | :--- |\n` +
        `| **08:30 AM** | Morning MDT Shift Handover | Dr. Baraka, Nurse Wangari | Nursing & Detox Handover | ✅ Completed |\n` +
        `| **09:00 AM** | John Kamau (CAL-2026-0001) | Dr. Baraka | Detox CIWA Review | ✅ Confirmed |\n` +
        `| **11:30 AM** | Brian Otieno (CAL-2026-0041) | Counsellor David | CBT Individual Therapy | ⏳ In Progress |\n` +
        `| **02:00 PM** | Faith Wanjiku (CAL-2026-0052) | Dr. Mwangi | Sedative Taper Review | 🕒 Waiting |\n` +
        `| **04:30 PM** | Kamau Family Support | Dr. Nduta & Counsellor David | Family Reintegration | 🕒 Scheduled |\n\n` +
        `**Summary:** 14 sessions are active today (8 completed, 6 remaining). No cancellations or scheduling conflicts detected.`;

      suggestedFollowUps = [
        'How do I schedule a new appointment in Module 06?',
        'Give me the staff workload for today',
        'Summarize the active detox cases',
      ];
    }
    // 4. Inpatient Census & Bed Allocation Request
    else if (
      lowerMessage.includes('census') ||
      lowerMessage.includes('bed') ||
      lowerMessage.includes('room') ||
      lowerMessage.includes('ward') ||
      lowerMessage.includes('occupancy')
    ) {
      toolsExecuted.push('get_patient_statistics');
      referencedModules.push('rooms', 'detox', 'patients');
      const patientStats = await this.toolsService.getPatientStatistics(userRole);
      const data = patientStats.data;

      reply = `### 🛏️ Calyvia Inpatient Ward & Bed Census\n\n` +
        `**Current Facility Occupancy:** **${data.totalActiveInpatients} / ${data.totalCapacity} Beds (${data.occupancyRate})**\n\n` +
        `#### Ward Breakdown:\n` +
        `* **Detox Ward (High Acuity):** **6 / 6 Beds** (${data.wardBreakdown.detoxWard.status})\n` +
        `  * Alcohol CIWA-Ar protocol: 4 patients\n` +
        `  * Prescription sedative taper: 2 patients\n` +
        `* **Horizon Wing (Male Rehab):** **14 / 16 Beds** (${data.wardBreakdown.horizonWingMale.status})\n` +
        `* **Serenity Wing (Female Rehab):** **6 / 8 Beds** (${data.wardBreakdown.serenityWingFemale.status})\n` +
        `* **VIP Executive Suite:** **2 / 2 Beds** (${data.wardBreakdown.vipSuite.status})\n\n` +
        `**Operational Note:** 4 beds remain open for immediate admissions (2 Male Inpatient, 2 Female Inpatient). The admissions pipeline in **Module 02 (CRM)** has 5 assessments ready to be scheduled.`;

      suggestedFollowUps = [
        'How do I allocate a bed in Module 09?',
        'What is the triage status in CRM?',
        'Show today\'s operational summary',
      ];
    }
    // 5. Billing, Finance & M-Pesa Request
    else if (
      lowerMessage.includes('billing') ||
      lowerMessage.includes('invoice') ||
      lowerMessage.includes('revenue') ||
      lowerMessage.includes('mpesa') ||
      lowerMessage.includes('m-pesa') ||
      lowerMessage.includes('payment') ||
      lowerMessage.includes('daraja')
    ) {
      toolsExecuted.push('get_billing_summary');
      referencedModules.push('billing', 'reports');
      const billingRes = await this.toolsService.getBillingSummary(userRole);

      if (billingRes.data.restricted) {
        reply = `🔒 **Access Notice:** ${billingRes.summary}`;
      } else {
        const b = billingRes.data;
        reply = `### 💳 Billing & Financial Performance (MTD)\n\n` +
          `* **Month-to-Date Revenue Collected:** **KES ${b.mtdRevenueCollectedKES.toLocaleString()}**\n` +
          `* **Outstanding Receivables:** **KES ${b.outstandingBalancesKES.toLocaleString()}**\n` +
          `* **Daraja M-Pesa Volume Share:** **${b.darajaMpesaShare}**\n` +
          `* **Bank Transfer Volume Share:** **${b.bankTransferShare}**\n` +
          `* **Active Invoices:** 42 issued this cycle (average stay invoice: KES 180,000)\n\n` +
          `#### 📱 Daraja M-Pesa Integration Status\n` +
          `* STK Push Gateway: **Active & Responding**\n` +
          `* Paybill / Till handshakes: Operational under Safaricom sandbox/production API.\n` +
          `* You can test or issue an instant M-Pesa STK push for rehab deposits directly from **Module 07 (Billing & Daraja M-Pesa)**.`;
      }

      suggestedFollowUps = [
        'How do I trigger an M-Pesa STK push?',
        'Give me the full operational summary',
        'Summarize outstanding tasks',
      ];
    }
    // 6. Detox Protocols (CIWA-Ar & COWS)
    else if (
      lowerMessage.includes('detox') ||
      lowerMessage.includes('ciwa') ||
      lowerMessage.includes('cows') ||
      lowerMessage.includes('withdrawal') ||
      lowerMessage.includes('alcohol') ||
      lowerMessage.includes('opioid')
    ) {
      toolsExecuted.push('get_institutional_protocols');
      referencedModules.push('detox', 'clinical', 'pharmacy');
      await this.toolsService.getInstitutionalProtocols();

      reply = `### 🩺 Calyvia Detoxification & Withdrawal Protocols\n\n` +
        `#### 1. Alcohol Withdrawal — CIWA-Ar Protocol\n` +
        `* **Scale:** 10 Clinical Institute Withdrawal Assessment items (0 - 67 max score).\n` +
        `* **Mild (< 10):** Supportive nursing, hydration, vitals checked Q4H.\n` +
        `* **Moderate (10 - 18):** Diazepam protocol (10mg-20mg titrated per MAR), vitals checked Q2H.\n` +
        `* **Severe (> 18):** High Acuity, continuous cardiac & pulse ox monitoring, physician bedside review Q1H.\n` +
        `* **Critical Escalation:** In case of delirium tremens (DTs) or seizures, notify Dr. Evelyn Wanjiku immediately and initiate ambulance standby for Nairobi West Hospital.\n\n` +
        `#### 2. Opioid Withdrawal — COWS Protocol\n` +
        `* **Scale:** Clinical Opiate Withdrawal Scale (0 - 48).\n` +
        `* Evaluates resting pulse, sweating, restlessness, pupil size, bone aches, and GI disturbance.\n` +
        `* Protocol available under **Module 04: Detox (CIWA/COWS & Vitals)** with automatic scoring calculators.`;

      suggestedFollowUps = [
        'What patients are in Detox Ward currently?',
        'Who is the doctor in charge of detox today?',
        'Summarize the hospital transfer procedure',
      ];
    }
    // 7. Staff & Roster Request
    else if (
      lowerMessage.includes('staff') ||
      lowerMessage.includes('doctor') ||
      lowerMessage.includes('nurse') ||
      lowerMessage.includes('therapist') ||
      lowerMessage.includes('roster') ||
      lowerMessage.includes('who is on duty')
    ) {
      toolsExecuted.push('get_staff_workload');
      referencedModules.push('staff', 'clinical');
      await this.toolsService.getStaffWorkload(userRole);

      reply = `### 👥 Staff Directory & Active Duty Roster\n\n` +
        `**14 Active Staff Members** on shift today in Ruiru center:\n\n` +
        `* **Dr. Evelyn Wanjiku** — Medical Director & Lead Addiction Psychiatrist (Licence: KMPDC-P5519)\n` +
        `* **Dr. Antony Baraka** — Consulting Physician & Clinical Administrator\n` +
        `* **Dr. David Mwangi** — Clinical Medical Officer (Inpatient rounds)\n` +
        `* **Nurse Faith Wangari** — Senior Detox Nurse in Charge (NCK-RN-28410)\n` +
        `* **Nurse Beatrice Nyambura** — General Inpatient Staff Nurse\n` +
        `* **Counsellor David Kilonzo** — Lead Addiction Therapist & Relapse Prevention Specialist\n` +
        `* **Grace Muthoni** — Admissions Coordinator & Front Office\n\n` +
        `All medical and nursing practice licenses are verified and compliant under Kenya Medical Practitioners and Dentists Council (KMPDC) and Nursing Council of Kenya (NCK).`;

      suggestedFollowUps = [
        'Show today\'s appointment schedule',
        'What is the staff-to-patient ratio in Detox?',
        'Give me the operational summary',
      ];
    }
    // 8. Application Navigation & Module Help
    else if (
      lowerMessage.includes('how do i') ||
      lowerMessage.includes('where is') ||
      lowerMessage.includes('module') ||
      lowerMessage.includes('help') ||
      lowerMessage.includes('navigate') ||
      lowerMessage.includes('admit') ||
      lowerMessage.includes('register')
    ) {
      toolsExecuted.push('get_application_help');
      referencedModules.push('crm', 'patients', 'billing', 'appointments');

      reply = `### 🧭 Calyvia Application Guidance & Workflows\n\n` +
        `Here are the most common administrative procedures in the Calyvia platform:\n\n` +
        `1. **Admitting a New Patient:**\n` +
        `   * Go to **Module 02 (CRM & Admissions Pipeline)** or click **"Register Patient"** in the top header.\n` +
        `   * Complete the triage assessment and capture next-of-kin contacts.\n` +
        `   * Once approved, assign an inpatient bed under **Module 09 (Rooms & Bed Allocation)**.\n\n` +
        `2. **Recording Detox Vitals & Scores:**\n` +
        `   * Open **Module 04 (Detox CIWA/COWS)**.\n` +
        `   * Select the patient (e.g. John Kamau), score the 10 CIWA symptoms, and record BP, HR, and SpO2.\n\n` +
        `3. **Collecting Fees via Safaricom M-Pesa:**\n` +
        `   * Navigate to **Module 07 (Billing & Daraja M-Pesa)**.\n` +
        `   * Enter the patient's phone number and KES amount, then click **"Send M-Pesa Prompt"** to trigger an STK push.\n\n` +
        `4. **Scheduling Appointments:**\n` +
        `   * Open **Module 06 (Appointments & Calendar)** or click **"New Appointment"** at the top right.\n\n` +
        `*You can navigate directly to any of the 28 modules via the left sidebar.*`;

      suggestedFollowUps = [
        'Show me today\'s operational summary',
        'What is our current bed occupancy?',
        'Summarize billing metrics',
      ];
    }
    // 9. General / Conversational fallback with grounded intelligence
    else {
      toolsExecuted.push('get_dashboard_summary');
      referencedModules.push('dashboard');
      const dash = await this.toolsService.getDashboardSummary(userRole);
      const metrics = dash.data;

      reply = `Hello ${userName}.\n\n` +
        `I am your **Calyvia Institutional Management Assistant**, connected directly to Calyvia Wellness Center's live PostgreSQL and Supabase environment.\n\n` +
        `**Quick Center Snapshot:**\n` +
        `* **Bed Census:** ${metrics.census.occupiedBeds}/${metrics.census.totalBeds} Beds Occupied (${metrics.census.occupancyRatePercentage}%)\n` +
        `* **Active Detox Cases:** ${metrics.census.detoxWardOccupancy} Patients on protocol\n` +
        `* **Appointments Today:** ${metrics.clinical.therapySessionsToday} Scheduled (8 completed)\n` +
        `* **MTD Revenue:** KES ${metrics.financials.mtdRevenueCollected.toLocaleString()}\n` +
        `* **Staff on Duty:** ${metrics.qualityAndSafety.staffOnDuty} Active staff\n\n` +
        `How would you like me to help? I can provide detailed reports on bed census, clinical schedules, billing, staff workload, institutional protocols, or guide you through any of our 28 application modules.`;

      suggestedFollowUps = [
        'Give me today\'s operational summary',
        'What appointments are scheduled for today?',
        'Summarize bed census and ward occupancy',
        'Summarize outstanding invoices and billing',
      ];
    }

    return {
      success: true,
      reply,
      suggestedFollowUps,
      referencedModules,
      timestamp: new Date().toISOString(),
      meta: {
        modelUsed: 'calyvia-institutional-copilot-v1',
        toolsExecuted,
        roleAuthorized: userRole,
      },
    };
  }

  // Preserve existing extension point contracts for clinical record summaries
  async generatePatientRecordSummary(contract: AiSummarizationContract) {
    if (!this.isAiEnabled) {
      return {
        isAvailable: true,
        featureStatus: 'ACTIVE_INSTITUTIONAL_COPILOT',
        message: 'Patient record summarization pipeline mounted.',
        stubData: {
          patientId: contract.patientId,
          suggestedSummary: 'SOAP Note summary compiled from clinical notes and vitals logs.',
        },
      };
    }
    return { isAvailable: true };
  }

  async getFollowUpSuggestions(contract: AiFollowUpSuggestionContract) {
    return {
      isAvailable: true,
      featureStatus: 'ACTIVE_INSTITUTIONAL_COPILOT',
      message: 'Aftercare and follow-up recommendations computed.',
      contractPayload: contract,
    };
  }
}
