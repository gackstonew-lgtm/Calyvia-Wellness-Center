-- ==============================================================================
-- 02_types_and_enums.sql
-- Calyvia Wellness Center Management System (HMIS/EMR)
-- Idempotent Custom ENUM Definitions
-- ==============================================================================

DO $$ BEGIN
    CREATE TYPE "UserRole" AS ENUM (
        'SUPER_ADMIN',
        'FACILITY_ADMIN',
        'MEDICAL_DIRECTOR',
        'DOCTOR_PSYCHIATRIST',
        'NURSE',
        'COUNSELLOR',
        'PHARMACIST',
        'ADMISSIONS_FRONT_DESK',
        'FINANCE_BILLING',
        'INVENTORY_STORE',
        'MANAGEMENT_EXECUTIVE'
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE "PatientStatus" AS ENUM (
        'ENQUIRY',
        'TRIAGE',
        'ADMITTED_DETOX',
        'ADMITTED_REHAB',
        'ON_LEAVE',
        'DISCHARGED',
        'AFTERCARE',
        'DECEASED'
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE "Gender" AS ENUM (
        'MALE',
        'FEMALE',
        'OTHER'
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE "AdmissionType" AS ENUM (
        'VOLUNTARY',
        'FAMILY_ESCORTED',
        'MEDICAL_TRANSFER',
        'COURT_ORDERED'
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE "ProgramType" AS ENUM (
        'DETOX_ONLY',
        'REHAB_30_DAYS',
        'REHAB_60_DAYS',
        'REHAB_90_DAYS',
        'OUTPATIENT',
        'AFTERCARE_ONLY'
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE "NoteType" AS ENUM (
        'PSYCHIATRIC_EVALUATION',
        'DOCTOR_CLINICAL_NOTE',
        'NURSING_SHIFT_NOTE',
        'MDT_REVIEW',
        'COUNSELLING_PROGRESS'
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE "DetoxProtocolType" AS ENUM (
        'ALCOHOL_CIWA',
        'OPIOID_COWS',
        'SEDATIVE_TAPER',
        'POLY_SUBSTANCE'
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE "ScoreType" AS ENUM (
        'CIWA_AR',
        'COWS'
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE "AssessmentSeverity" AS ENUM (
        'MILD',
        'MODERATE',
        'SEVERE'
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE "RoomType" AS ENUM (
        'DETOX_WARD',
        'INPATIENT_MALE',
        'INPATIENT_FEMALE',
        'VIP_PRIVATE',
        'HIGH_DEPENDENCY_UNIT'
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE "BedStatus" AS ENUM (
        'AVAILABLE',
        'OCCUPIED',
        'MAINTENANCE',
        'RESERVED'
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE "InvoiceStatus" AS ENUM (
        'DRAFT',
        'ISSUED',
        'PARTIALLY_PAID',
        'FULLY_PAID',
        'VOID'
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE "PaymentMethod" AS ENUM (
        'MPESA_STK',
        'MPESA_C2B',
        'BANK_TRANSFER',
        'CASH',
        'INSURANCE_COPAY'
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE "IncidentSeverity" AS ENUM (
        'LOW',
        'MEDIUM',
        'HIGH',
        'CRITICAL'
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE "TaskPriority" AS ENUM (
        'LOW',
        'MEDIUM',
        'HIGH',
        'URGENT'
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE "TaskStatus" AS ENUM (
        'PENDING',
        'IN_PROGRESS',
        'COMPLETED',
        'OVERDUE',
        'CANCELLED'
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
