/**
 * Calyvia Wellness Center - Shared Types, Enums & Utilities
 */

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  FACILITY_ADMIN = 'FACILITY_ADMIN',
  MEDICAL_DIRECTOR = 'MEDICAL_DIRECTOR',
  DOCTOR_PSYCHIATRIST = 'DOCTOR_PSYCHIATRIST',
  NURSE = 'NURSE',
  COUNSELLOR = 'COUNSELLOR',
  PHARMACIST = 'PHARMACIST',
  ADMISSIONS_FRONT_DESK = 'ADMISSIONS_FRONT_DESK',
  FINANCE_BILLING = 'FINANCE_BILLING',
  INVENTORY_STORE = 'INVENTORY_STORE',
  MANAGEMENT_EXECUTIVE = 'MANAGEMENT_EXECUTIVE',
}

export enum PatientStatus {
  ENQUIRY = 'ENQUIRY',
  TRIAGE = 'TRIAGE',
  ADMITTED_DETOX = 'ADMITTED_DETOX',
  ADMITTED_REHAB = 'ADMITTED_REHAB',
  ON_LEAVE = 'ON_LEAVE',
  DISCHARGED = 'DISCHARGED',
  AFTERCARE = 'AFTERCARE',
  DECEASED = 'DECEASED',
}

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
}

export enum AdmissionType {
  VOLUNTARY = 'VOLUNTARY',
  FAMILY_ESCORTED = 'FAMILY_ESCORTED',
  MEDICAL_TRANSFER = 'MEDICAL_TRANSFER',
  COURT_ORDERED = 'COURT_ORDERED',
}

export enum ProgramType {
  DETOX_ONLY = 'DETOX_ONLY',
  REHAB_30_DAYS = 'REHAB_30_DAYS',
  REHAB_60_DAYS = 'REHAB_60_DAYS',
  REHAB_90_DAYS = 'REHAB_90_DAYS',
  OUTPATIENT = 'OUTPATIENT',
  AFTERCARE_ONLY = 'AFTERCARE_ONLY',
}

export enum ClinicalNoteType {
  PSYCHIATRIC_EVALUATION = 'PSYCHIATRIC_EVALUATION',
  DOCTOR_CLINICAL_NOTE = 'DOCTOR_CLINICAL_NOTE',
  NURSING_SHIFT_NOTE = 'NURSING_SHIFT_NOTE',
  MDT_REVIEW = 'MDT_REVIEW',
  COUNSELLING_PROGRESS = 'COUNSELLING_PROGRESS',
}

export enum DetoxProtocolType {
  ALCOHOL_CIWA = 'ALCOHOL_CIWA',
  OPIOID_COWS = 'OPIOID_COWS',
  SEDATIVE_TAPER = 'SEDATIVE_TAPER',
  POLY_SUBSTANCE = 'POLY_SUBSTANCE',
}

export enum WithdrawalScoreType {
  CIWA_AR = 'CIWA_AR',
  COWS = 'COWS',
}
export { WithdrawalScoreType as ScoreType };

export enum AssessmentSeverity {
  MILD = 'MILD',
  MODERATE = 'MODERATE',
  SEVERE = 'SEVERE',
}

export enum RoomType {
  DETOX_WARD = 'DETOX_WARD',
  INPATIENT_MALE = 'INPATIENT_MALE',
  INPATIENT_FEMALE = 'INPATIENT_FEMALE',
  VIP_PRIVATE = 'VIP_PRIVATE',
  HIGH_DEPENDENCY_UNIT = 'HIGH_DEPENDENCY_UNIT',
}

export enum BedStatus {
  AVAILABLE = 'AVAILABLE',
  OCCUPIED = 'OCCUPIED',
  MAINTENANCE = 'MAINTENANCE',
  RESERVED = 'RESERVED',
}

export enum InvoiceStatus {
  DRAFT = 'DRAFT',
  ISSUED = 'ISSUED',
  PARTIALLY_PAID = 'PARTIALLY_PAID',
  FULLY_PAID = 'FULLY_PAID',
  VOID = 'VOID',
}

export enum PaymentMethod {
  MPESA_STK = 'MPESA_STK',
  MPESA_C2B = 'MPESA_C2B',
  BANK_TRANSFER = 'BANK_TRANSFER',
  CASH = 'CASH',
  INSURANCE_COPAY = 'INSURANCE_COPAY',
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export enum TaskStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED',
}

export enum IncidentSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum CommunicationChannel {
  SMS = 'SMS',
  WHATSAPP = 'WHATSAPP',
  EMAIL = 'EMAIL',
}

export enum LeadStatus {
  NEW_INQUIRY = 'NEW_INQUIRY',
  CONTACTED = 'CONTACTED',
  ASSESSMENT_BOOKED = 'ASSESSMENT_BOOKED',
  ADMISSION_SCHEDULED = 'ADMISSION_SCHEDULED',
  ADMITTED = 'ADMITTED',
  LOST = 'LOST',
}

// Kenya Normalization and Formatting Utilities
export class KenyaUtils {
  /**
   * Normalizes Kenyan phone numbers to E.164 (+2547XXXXXXXX or +2541XXXXXXXX)
   */
  static normalizePhoneNumber(rawPhone: string): string {
    if (!rawPhone) return '';
    let cleaned = rawPhone.replace(/\D/g, '');
    if (cleaned.startsWith('0') && cleaned.length === 10) {
      cleaned = '254' + cleaned.substring(1);
    } else if (cleaned.startsWith('7') && cleaned.length === 9) {
      cleaned = '254' + cleaned;
    } else if (cleaned.startsWith('1') && cleaned.length === 9) {
      cleaned = '254' + cleaned;
    }
    if (!cleaned.startsWith('+')) {
      return '+' + cleaned;
    }
    return cleaned;
  }

  /**
   * Formats numbers to KES currency
   */
  static formatKES(amount: number): string {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 2,
    }).format(amount);
  }

  /**
   * Masks sensitive identifier (e.g. Kenya National ID 12345678 -> 12****78)
   */
  static maskIdentifier(id: string): string {
    if (!id || id.length < 4) return '****';
    const firstTwo = id.substring(0, 2);
    const lastTwo = id.substring(id.length - 2);
    return `${firstTwo}${'*'.repeat(Math.max(id.length - 4, 3))}${lastTwo}`;
  }
}
