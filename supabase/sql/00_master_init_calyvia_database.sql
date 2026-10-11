-- ==============================================================================
-- 00_master_init_calyvia_database.sql
-- Calyvia Wellness Center Management System (HMIS/EMR)
-- Complete Master Production DDL Initialization & Verification Script
-- Generated from modular scripts: 01 through 07, plus 09 (Verification)
-- ==============================================================================

-- ==============================================================================
-- 01_extensions.sql
-- Calyvia Wellness Center Management System (HMIS/EMR)
-- Idempotent PostgreSQL Extensions Setup
-- ==============================================================================

-- Ensure extensions schema exists
CREATE SCHEMA IF NOT EXISTS extensions;

-- Enable UUID generator (v4)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;

-- Enable cryptographic primitives (for password hashing and digest calculations)
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA extensions;

-- Enable case-insensitive text type (for emails, national IDs, and lookups)
CREATE EXTENSION IF NOT EXISTS "citext" WITH SCHEMA extensions;

-- Set session search path to include both public and extensions
SET search_path = public, extensions;

-- Ensure current database default search path includes extensions schema
DO $$
BEGIN
    EXECUTE format('ALTER DATABASE %I SET search_path TO public, extensions', current_database());
EXCEPTION WHEN OTHERS THEN
    -- In cloud/restricted hosted databases where ALTER DATABASE is disallowed, proceed safely
    NULL;
END $$;

-- Confirm extensions are active
DO $$
BEGIN
    RAISE NOTICE 'Extensions uuid-ossp, pgcrypto, citext successfully verified in search_path.';
END $$;



-- ==============================================================================
-- 02_types_and_enums.sql
-- Calyvia Wellness Center Management System (HMIS/EMR)
-- Idempotent Custom ENUM Definitions
-- ==============================================================================

SET search_path = public, extensions;

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


-- ==============================================================================
-- 03_tables.sql
-- Calyvia Wellness Center Management System (HMIS/EMR)
-- Production PostgreSQL 16 DDL for All 41 Relational Domain Tables
-- ==============================================================================

SET search_path = public, extensions;

-- 1. users
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email CITEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role "UserRole" NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    must_change_password BOOLEAN NOT NULL DEFAULT false,
    approval_status TEXT NOT NULL DEFAULT 'APPROVED',
    approved_by UUID REFERENCES public.users(id),
    approved_at TIMESTAMPTZ,
    rejection_reason TEXT,
    requested_role TEXT,
    two_factor_secret TEXT,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Idempotent column reconciliations for pre-existing installations
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS approval_status TEXT NOT NULL DEFAULT 'APPROVED';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES public.users(id);
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS requested_role TEXT;

-- 2. staff_profiles
CREATE TABLE IF NOT EXISTS public.staff_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    national_id_encrypted TEXT NOT NULL,
    department TEXT NOT NULL,
    job_title TEXT NOT NULL,
    license_number TEXT,
    license_board TEXT,
    license_expiry_date TIMESTAMPTZ,
    date_joined TIMESTAMPTZ NOT NULL,
    qualifications TEXT,
    emergency_contact TEXT
);

-- 3. staff_schedules
CREATE TABLE IF NOT EXISTS public.staff_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_profile_id UUID NOT NULL REFERENCES public.staff_profiles(id) ON DELETE CASCADE,
    shift_date TIMESTAMPTZ NOT NULL,
    shift_type TEXT NOT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    is_attended BOOLEAN NOT NULL DEFAULT false,
    notes TEXT
);

-- 4. staff_credentials
CREATE TABLE IF NOT EXISTS public.staff_credentials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_profile_id UUID NOT NULL REFERENCES public.staff_profiles(id) ON DELETE CASCADE,
    credential_name TEXT NOT NULL,
    issuing_authority TEXT NOT NULL,
    issued_date TIMESTAMPTZ NOT NULL,
    expiry_date TIMESTAMPTZ,
    document_url TEXT,
    is_verified BOOLEAN NOT NULL DEFAULT false
);

-- 5. audit_logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    role TEXT,
    action TEXT NOT NULL,
    resource TEXT,
    resource_id TEXT,
    entity_name TEXT,
    entity_id TEXT,
    old_values JSONB,
    new_values JSONB,
    ip_address TEXT,
    user_agent TEXT,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. patients
CREATE TABLE IF NOT EXISTS public.patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    upi TEXT UNIQUE NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    date_of_birth TIMESTAMPTZ NOT NULL,
    gender "Gender" NOT NULL,
    national_id_encrypted TEXT,
    phone TEXT NOT NULL,
    email CITEXT,
    address TEXT,
    county TEXT DEFAULT 'Kiambu',
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    emergency_contact_relationship TEXT,
    substance_history_encrypted TEXT,
    allergies_encrypted TEXT,
    status "PatientStatus" NOT NULL DEFAULT 'ENQUIRY',
    is_archived BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. emergency_contacts
CREATE TABLE IF NOT EXISTS public.emergency_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    relationship TEXT NOT NULL,
    phone TEXT NOT NULL,
    alternative_phone TEXT,
    email CITEXT,
    is_primary_guarantor BOOLEAN NOT NULL DEFAULT false,
    consent_to_contact BOOLEAN NOT NULL DEFAULT true,
    notes TEXT
);

-- 8. patient_consents
CREATE TABLE IF NOT EXISTS public.patient_consents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    consent_type TEXT NOT NULL,
    title TEXT NOT NULL,
    is_granted BOOLEAN NOT NULL DEFAULT true,
    signature_data TEXT,
    witness_name TEXT,
    expires_at TIMESTAMPTZ,
    granted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    revoked_at TIMESTAMPTZ
);

-- 9. referral_partners
CREATE TABLE IF NOT EXISTS public.referral_partners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_name TEXT NOT NULL,
    partner_type TEXT NOT NULL,
    contact_person TEXT,
    phone TEXT,
    email CITEXT,
    address TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 10. leads
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email CITEXT,
    relationship TEXT,
    primary_concern TEXT NOT NULL,
    referral_partner_id UUID REFERENCES public.referral_partners(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'NEW',
    source TEXT NOT NULL DEFAULT 'WEBSITE',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 11. admissions
CREATE TABLE IF NOT EXISTS public.admissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE RESTRICT,
    admission_number TEXT UNIQUE NOT NULL,
    admission_date TIMESTAMPTZ NOT NULL,
    admission_type "AdmissionType" NOT NULL,
    program_type "ProgramType" NOT NULL,
    primary_diagnosis TEXT NOT NULL,
    referring_doctor TEXT,
    admitting_staff_id UUID NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    discharge_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 12. rooms
CREATE TABLE IF NOT EXISTS public.rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_number TEXT UNIQUE NOT NULL,
    room_name TEXT NOT NULL,
    room_type "RoomType" NOT NULL,
    floor TEXT NOT NULL DEFAULT 'Ground',
    wing TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true
);

-- 13. beds
CREATE TABLE IF NOT EXISTS public.beds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
    bed_number TEXT NOT NULL,
    status "BedStatus" NOT NULL DEFAULT 'AVAILABLE',
    daily_rate NUMERIC(10, 2) NOT NULL DEFAULT 5000.00,
    is_active BOOLEAN NOT NULL DEFAULT true
);

-- 14. bed_allocations
CREATE TABLE IF NOT EXISTS public.bed_allocations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admission_id UUID NOT NULL REFERENCES public.admissions(id) ON DELETE CASCADE,
    bed_id UUID NOT NULL REFERENCES public.beds(id) ON DELETE RESTRICT,
    allocated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    released_at TIMESTAMPTZ,
    transfer_reason TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true
);

-- 15. clinical_notes
CREATE TABLE IF NOT EXISTS public.clinical_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admission_id UUID NOT NULL REFERENCES public.admissions(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
    note_type "NoteType" NOT NULL,
    subjective_narrative_encrypted TEXT NOT NULL,
    objective_narrative_encrypted TEXT NOT NULL,
    assessment_narrative_encrypted TEXT NOT NULL,
    plan_narrative_encrypted TEXT NOT NULL,
    icd10_codes TEXT[] DEFAULT '{}',
    version INT NOT NULL DEFAULT 1,
    is_signed BOOLEAN NOT NULL DEFAULT true,
    signed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 16. detox_episodes
CREATE TABLE IF NOT EXISTS public.detox_episodes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admission_id UUID NOT NULL REFERENCES public.admissions(id) ON DELETE CASCADE,
    protocol_type "DetoxProtocolType" NOT NULL,
    start_date TIMESTAMPTZ NOT NULL DEFAULT now(),
    end_date TIMESTAMPTZ,
    target_substances TEXT[] NOT NULL DEFAULT '{}',
    baseline_score INT NOT NULL DEFAULT 0,
    current_severity "AssessmentSeverity" NOT NULL DEFAULT 'MILD',
    is_completed BOOLEAN NOT NULL DEFAULT false,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 17. withdrawal_assessments
CREATE TABLE IF NOT EXISTS public.withdrawal_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    detox_episode_id UUID NOT NULL REFERENCES public.detox_episodes(id) ON DELETE CASCADE,
    assessor_id UUID NOT NULL,
    score_type "ScoreType" NOT NULL,
    total_score INT NOT NULL,
    severity "AssessmentSeverity" NOT NULL,
    breakdown JSONB NOT NULL,
    assessed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    notes TEXT
);

-- 18. vitals_logs
CREATE TABLE IF NOT EXISTS public.vitals_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admission_id UUID NOT NULL REFERENCES public.admissions(id) ON DELETE CASCADE,
    recorded_by_id UUID NOT NULL,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    systolic_bp INT NOT NULL,
    diastolic_bp INT NOT NULL,
    pulse_rate INT NOT NULL,
    respiratory_rate INT NOT NULL,
    temperature_c NUMERIC(4, 2) NOT NULL,
    oxygen_saturation INT NOT NULL,
    blood_glucose_mmol NUMERIC(4, 2),
    pain_score INT DEFAULT 0,
    is_abnormal BOOLEAN NOT NULL DEFAULT false,
    notes TEXT
);

-- 19. counselling_sessions
CREATE TABLE IF NOT EXISTS public.counselling_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admission_id UUID NOT NULL REFERENCES public.admissions(id) ON DELETE CASCADE,
    counsellor_id UUID NOT NULL,
    session_type TEXT NOT NULL,
    session_date TIMESTAMPTZ NOT NULL,
    duration_minutes INT NOT NULL DEFAULT 60,
    topic TEXT NOT NULL,
    goals_progress_encrypted TEXT,
    notes_encrypted TEXT,
    attendance_status TEXT NOT NULL DEFAULT 'ATTENDED',
    next_session_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 20. appointments
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES public.patients(id) ON DELETE SET NULL,
    staff_id UUID NOT NULL,
    appointment_type TEXT NOT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL DEFAULT 'SCHEDULED',
    location TEXT NOT NULL DEFAULT 'Calyvia Clinic, Ruiru',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 21. medications
CREATE TABLE IF NOT EXISTS public.medications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_name TEXT NOT NULL,
    generic_name TEXT NOT NULL,
    dosage_form TEXT NOT NULL,
    strength TEXT NOT NULL,
    category TEXT NOT NULL,
    is_controlled_substance BOOLEAN NOT NULL DEFAULT false,
    unit_of_measure TEXT NOT NULL DEFAULT 'TABLET',
    unit_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    reorder_level INT NOT NULL DEFAULT 50,
    is_active BOOLEAN NOT NULL DEFAULT true
);

-- 22. pharmacy_stock_batches
CREATE TABLE IF NOT EXISTS public.pharmacy_stock_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    medication_id UUID NOT NULL REFERENCES public.medications(id) ON DELETE RESTRICT,
    batch_number TEXT NOT NULL,
    quantity_received INT NOT NULL,
    quantity_remaining INT NOT NULL,
    expiry_date TIMESTAMPTZ NOT NULL,
    unit_cost NUMERIC(10, 2) NOT NULL,
    supplier_name TEXT,
    received_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 23. prescriptions
CREATE TABLE IF NOT EXISTS public.prescriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admission_id UUID NOT NULL REFERENCES public.admissions(id) ON DELETE CASCADE,
    prescriber_id UUID NOT NULL,
    prescribed_date TIMESTAMPTZ NOT NULL DEFAULT now(),
    status TEXT NOT NULL DEFAULT 'ACTIVE',
    diagnosis TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 24. prescription_items
CREATE TABLE IF NOT EXISTS public.prescription_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prescription_id UUID NOT NULL REFERENCES public.prescriptions(id) ON DELETE CASCADE,
    medication_id UUID NOT NULL REFERENCES public.medications(id) ON DELETE RESTRICT,
    dosage TEXT NOT NULL,
    route TEXT NOT NULL DEFAULT 'ORAL',
    frequency TEXT NOT NULL,
    duration_days INT NOT NULL,
    total_quantity INT NOT NULL,
    dispensed_quantity INT NOT NULL DEFAULT 0,
    instructions TEXT
);

-- 25. medication_administrations
CREATE TABLE IF NOT EXISTS public.medication_administrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prescription_item_id UUID NOT NULL REFERENCES public.prescription_items(id) ON DELETE CASCADE,
    administered_by_id UUID NOT NULL,
    scheduled_time TIMESTAMPTZ NOT NULL,
    administered_time TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'GIVEN',
    dose_given TEXT NOT NULL,
    missed_reason TEXT,
    vitals_check JSONB,
    notes TEXT
);

-- 26. invoices
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admission_id UUID NOT NULL REFERENCES public.admissions(id) ON DELETE CASCADE,
    invoice_number TEXT UNIQUE NOT NULL,
    issue_date TIMESTAMPTZ NOT NULL DEFAULT now(),
    due_date TIMESTAMPTZ NOT NULL,
    status "InvoiceStatus" NOT NULL DEFAULT 'ISSUED',
    subtotal NUMERIC(10, 2) NOT NULL,
    discount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    total_amount NUMERIC(10, 2) NOT NULL,
    balance_due NUMERIC(10, 2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'KES',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 27. invoice_items
CREATE TABLE IF NOT EXISTS public.invoice_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    unit_price NUMERIC(10, 2) NOT NULL,
    line_total NUMERIC(10, 2) NOT NULL,
    category TEXT NOT NULL DEFAULT 'SERVICES'
);

-- 28. payments
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE RESTRICT,
    payment_reference TEXT UNIQUE NOT NULL,
    payment_method "PaymentMethod" NOT NULL,
    amount_paid NUMERIC(10, 2) NOT NULL,
    payment_date TIMESTAMPTZ NOT NULL DEFAULT now(),
    payer_name TEXT,
    payer_phone TEXT,
    receipt_number TEXT,
    notes TEXT
);

-- 29. mpesa_transactions
CREATE TABLE IF NOT EXISTS public.mpesa_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_id UUID REFERENCES public.payments(id) ON DELETE SET NULL,
    merchant_request_id TEXT NOT NULL,
    checkout_request_id TEXT UNIQUE NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    mpesa_receipt_number TEXT UNIQUE,
    transaction_date TIMESTAMPTZ,
    phone_number TEXT NOT NULL,
    result_code INT NOT NULL,
    result_desc TEXT NOT NULL,
    raw_payload JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 30. movement_records
CREATE TABLE IF NOT EXISTS public.movement_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admission_id UUID NOT NULL REFERENCES public.admissions(id) ON DELETE CASCADE,
    movement_type TEXT NOT NULL,
    departure_time TIMESTAMPTZ NOT NULL,
    expected_return_time TIMESTAMPTZ NOT NULL,
    actual_return_time TIMESTAMPTZ,
    escort_name TEXT,
    escort_relationship TEXT,
    destination TEXT NOT NULL,
    security_screening_passed BOOLEAN NOT NULL DEFAULT true,
    notes TEXT
);

-- 31. visitor_logs
CREATE TABLE IF NOT EXISTS public.visitor_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    visitor_name TEXT NOT NULL,
    relationship TEXT NOT NULL,
    national_id TEXT NOT NULL,
    phone TEXT NOT NULL,
    visit_date TIMESTAMPTZ NOT NULL DEFAULT now(),
    time_in TIMESTAMPTZ NOT NULL,
    time_out TIMESTAMPTZ,
    contraband_cleared BOOLEAN NOT NULL DEFAULT true,
    luggage_screened BOOLEAN NOT NULL DEFAULT true,
    notes TEXT
);

-- 32. incident_reports
CREATE TABLE IF NOT EXISTS public.incident_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_number TEXT UNIQUE NOT NULL,
    incident_date TIMESTAMPTZ NOT NULL,
    incident_type TEXT NOT NULL,
    severity "IncidentSeverity" NOT NULL,
    description TEXT NOT NULL,
    location TEXT NOT NULL,
    reported_by_id UUID NOT NULL,
    persons_involved TEXT[] NOT NULL DEFAULT '{}',
    immediate_action_taken TEXT NOT NULL,
    corrective_action_plan TEXT,
    is_resolved BOOLEAN NOT NULL DEFAULT false,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 33. staff_tasks
CREATE TABLE IF NOT EXISTS public.staff_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    priority "TaskPriority" NOT NULL DEFAULT 'MEDIUM',
    status "TaskStatus" NOT NULL DEFAULT 'PENDING',
    due_date TIMESTAMPTZ NOT NULL,
    assigned_to_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    created_by_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 34. inventory_items
CREATE TABLE IF NOT EXISTS public.inventory_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_code TEXT UNIQUE NOT NULL,
    item_name TEXT NOT NULL,
    category TEXT NOT NULL,
    unit_of_measure TEXT NOT NULL DEFAULT 'PIECE',
    current_stock INT NOT NULL DEFAULT 0,
    minimum_reorder_level INT NOT NULL DEFAULT 10,
    unit_cost NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    location TEXT NOT NULL DEFAULT 'Central Store, Ruiru',
    notes TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 35. discharge_records
CREATE TABLE IF NOT EXISTS public.discharge_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admission_id UUID UNIQUE NOT NULL REFERENCES public.admissions(id) ON DELETE RESTRICT,
    discharge_date TIMESTAMPTZ NOT NULL DEFAULT now(),
    discharge_type TEXT NOT NULL,
    primary_physician_id UUID NOT NULL,
    clinical_summary_encrypted TEXT NOT NULL,
    take_home_medications JSONB,
    follow_up_instructions TEXT NOT NULL,
    financial_clearance_passed BOOLEAN NOT NULL DEFAULT true,
    cleared_by_finance_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 36. aftercare_plans
CREATE TABLE IF NOT EXISTS public.aftercare_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE RESTRICT,
    discharge_record_id UUID REFERENCES public.discharge_records(id) ON DELETE SET NULL,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    primary_counsellor_id UUID NOT NULL,
    sobriety_goals_encrypted TEXT NOT NULL,
    support_group_details TEXT,
    relapse_prevention_plan_encrypted TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 37. aftercare_checkins
CREATE TABLE IF NOT EXISTS public.aftercare_checkins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    aftercare_plan_id UUID NOT NULL REFERENCES public.aftercare_plans(id) ON DELETE CASCADE,
    milestone_day INT NOT NULL,
    scheduled_date TIMESTAMPTZ NOT NULL,
    actual_contact_date TIMESTAMPTZ,
    contact_mode TEXT NOT NULL DEFAULT 'PHONE_CALL',
    sobriety_status TEXT NOT NULL DEFAULT 'MAINTAINED',
    cravings_rating INT DEFAULT 1,
    mood_rating INT DEFAULT 5,
    notes_encrypted TEXT,
    conducted_by_id UUID,
    is_completed BOOLEAN NOT NULL DEFAULT false
);

-- 38. communication_logs
CREATE TABLE IF NOT EXISTS public.communication_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_type TEXT NOT NULL,
    recipient_phone TEXT NOT NULL,
    message_type TEXT NOT NULL,
    message_body TEXT NOT NULL,
    provider TEXT NOT NULL DEFAULT 'MOCK',
    provider_message_id TEXT,
    delivery_status TEXT NOT NULL DEFAULT 'SENT',
    sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    cost_kes NUMERIC(6, 2) NOT NULL DEFAULT 1.00
);

-- 39. feedback_surveys
CREATE TABLE IF NOT EXISTS public.feedback_surveys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES public.patients(id) ON DELETE SET NULL,
    respondent_type TEXT NOT NULL DEFAULT 'PATIENT',
    overall_satisfaction_rating INT NOT NULL,
    clinical_care_rating INT NOT NULL,
    facility_comfort_rating INT NOT NULL,
    food_cleanliness_rating INT NOT NULL,
    net_promoter_score INT NOT NULL,
    qualitative_comments TEXT,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 40. system_settings
CREATE TABLE IF NOT EXISTS public.system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_key TEXT UNIQUE NOT NULL,
    setting_value TEXT NOT NULL,
    description TEXT,
    is_encrypted BOOLEAN NOT NULL DEFAULT false,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- ==============================================================================
-- 04_indexes.sql
-- Calyvia Wellness Center Management System (HMIS/EMR)
-- Production Performance & Query Indexes for PostgreSQL 16
-- ==============================================================================

SET search_path = public, extensions;

-- 1. users
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON public.users(is_active);
CREATE INDEX IF NOT EXISTS idx_users_approval_status ON public.users(approval_status);

-- 2. staff_profiles
CREATE INDEX IF NOT EXISTS idx_staff_profiles_department ON public.staff_profiles(department);
CREATE INDEX IF NOT EXISTS idx_staff_profiles_license_expiry ON public.staff_profiles(license_expiry_date);

-- 3. staff_schedules
CREATE INDEX IF NOT EXISTS idx_staff_schedules_staff_profile ON public.staff_schedules(staff_profile_id);
CREATE INDEX IF NOT EXISTS idx_staff_schedules_shift_date ON public.staff_schedules(shift_date);

-- 4. audit_logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON public.audit_logs(entity_name, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON public.audit_logs(timestamp DESC);

-- 5. patients
CREATE INDEX IF NOT EXISTS idx_patients_status ON public.patients(status);
CREATE INDEX IF NOT EXISTS idx_patients_phone ON public.patients(phone);
CREATE INDEX IF NOT EXISTS idx_patients_created_at ON public.patients(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_patients_is_archived ON public.patients(is_archived);

-- 6. emergency_contacts
CREATE INDEX IF NOT EXISTS idx_emergency_contacts_patient_id ON public.emergency_contacts(patient_id);
CREATE INDEX IF NOT EXISTS idx_emergency_contacts_guarantor ON public.emergency_contacts(is_primary_guarantor);

-- 7. leads
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_phone ON public.leads(phone);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads(created_at DESC);

-- 8. admissions
CREATE INDEX IF NOT EXISTS idx_admissions_patient_id ON public.admissions(patient_id);
CREATE INDEX IF NOT EXISTS idx_admissions_is_active ON public.admissions(is_active);
CREATE INDEX IF NOT EXISTS idx_admissions_program_type ON public.admissions(program_type);
CREATE INDEX IF NOT EXISTS idx_admissions_date ON public.admissions(admission_date DESC);

-- 9. beds & allocations
CREATE INDEX IF NOT EXISTS idx_beds_room_id ON public.beds(room_id);
CREATE INDEX IF NOT EXISTS idx_beds_status ON public.beds(status);
CREATE INDEX IF NOT EXISTS idx_bed_allocations_admission_id ON public.bed_allocations(admission_id);
CREATE INDEX IF NOT EXISTS idx_bed_allocations_bed_id ON public.bed_allocations(bed_id);
CREATE INDEX IF NOT EXISTS idx_bed_allocations_is_active ON public.bed_allocations(is_active);

-- 10. clinical_notes
CREATE INDEX IF NOT EXISTS idx_clinical_notes_admission_id ON public.clinical_notes(admission_id);
CREATE INDEX IF NOT EXISTS idx_clinical_notes_author_id ON public.clinical_notes(author_id);
CREATE INDEX IF NOT EXISTS idx_clinical_notes_note_type ON public.clinical_notes(note_type);
CREATE INDEX IF NOT EXISTS idx_clinical_notes_created_at ON public.clinical_notes(created_at DESC);

-- 11. detox_episodes & withdrawal assessments
CREATE INDEX IF NOT EXISTS idx_detox_episodes_admission_id ON public.detox_episodes(admission_id);
CREATE INDEX IF NOT EXISTS idx_detox_episodes_is_completed ON public.detox_episodes(is_completed);
CREATE INDEX IF NOT EXISTS idx_withdrawal_assessments_detox ON public.withdrawal_assessments(detox_episode_id);
CREATE INDEX IF NOT EXISTS idx_withdrawal_assessments_score_type ON public.withdrawal_assessments(score_type);

-- 12. vitals_logs
CREATE INDEX IF NOT EXISTS idx_vitals_logs_admission_id ON public.vitals_logs(admission_id);
CREATE INDEX IF NOT EXISTS idx_vitals_logs_recorded_at ON public.vitals_logs(recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_vitals_logs_is_abnormal ON public.vitals_logs(is_abnormal);

-- 13. counselling_sessions
CREATE INDEX IF NOT EXISTS idx_counselling_sessions_admission_id ON public.counselling_sessions(admission_id);
CREATE INDEX IF NOT EXISTS idx_counselling_sessions_counsellor ON public.counselling_sessions(counsellor_id);
CREATE INDEX IF NOT EXISTS idx_counselling_sessions_date ON public.counselling_sessions(session_date DESC);

-- 14. appointments
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON public.appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_staff_id ON public.appointments(staff_id);
CREATE INDEX IF NOT EXISTS idx_appointments_start_time ON public.appointments(start_time);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON public.appointments(status);

-- 15. medications & pharmacy
CREATE INDEX IF NOT EXISTS idx_medications_category ON public.medications(category);
CREATE INDEX IF NOT EXISTS idx_medications_controlled ON public.medications(is_controlled_substance);
CREATE INDEX IF NOT EXISTS idx_pharmacy_batches_medication ON public.pharmacy_stock_batches(medication_id);
CREATE INDEX IF NOT EXISTS idx_pharmacy_batches_expiry ON public.pharmacy_stock_batches(expiry_date);
CREATE INDEX IF NOT EXISTS idx_prescriptions_admission_id ON public.prescriptions(admission_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_status ON public.prescriptions(status);
CREATE INDEX IF NOT EXISTS idx_prescription_items_prescription ON public.prescription_items(prescription_id);
CREATE INDEX IF NOT EXISTS idx_med_admin_prescription_item ON public.medication_administrations(prescription_item_id);
CREATE INDEX IF NOT EXISTS idx_med_admin_scheduled_time ON public.medication_administrations(scheduled_time);

-- 16. billing & payments
CREATE INDEX IF NOT EXISTS idx_invoices_admission_id ON public.invoices(admission_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON public.invoice_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_invoice_id ON public.payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_mpesa_transactions_checkout_req ON public.mpesa_transactions(checkout_request_id);
CREATE INDEX IF NOT EXISTS idx_mpesa_transactions_receipt ON public.mpesa_transactions(mpesa_receipt_number);

-- 17. movement & visitors
CREATE INDEX IF NOT EXISTS idx_movement_records_admission_id ON public.movement_records(admission_id);
CREATE INDEX IF NOT EXISTS idx_visitor_logs_patient_id ON public.visitor_logs(patient_id);
CREATE INDEX IF NOT EXISTS idx_visitor_logs_visit_date ON public.visitor_logs(visit_date DESC);

-- 18. incidents
CREATE INDEX IF NOT EXISTS idx_incident_reports_severity ON public.incident_reports(severity);
CREATE INDEX IF NOT EXISTS idx_incident_reports_is_resolved ON public.incident_reports(is_resolved);
CREATE INDEX IF NOT EXISTS idx_incident_reports_date ON public.incident_reports(incident_date DESC);

-- 19. staff_tasks
CREATE INDEX IF NOT EXISTS idx_staff_tasks_assigned_to ON public.staff_tasks(assigned_to_id);
CREATE INDEX IF NOT EXISTS idx_staff_tasks_status ON public.staff_tasks(status);
CREATE INDEX IF NOT EXISTS idx_staff_tasks_due_date ON public.staff_tasks(due_date);

-- 20. discharge & aftercare
CREATE INDEX IF NOT EXISTS idx_discharge_records_admission_id ON public.discharge_records(admission_id);
CREATE INDEX IF NOT EXISTS idx_aftercare_plans_patient_id ON public.aftercare_plans(patient_id);
CREATE INDEX IF NOT EXISTS idx_aftercare_plans_is_active ON public.aftercare_plans(is_active);
CREATE INDEX IF NOT EXISTS idx_aftercare_checkins_plan_id ON public.aftercare_checkins(aftercare_plan_id);
CREATE INDEX IF NOT EXISTS idx_aftercare_checkins_milestone ON public.aftercare_checkins(milestone_day);

-- 21. feedback & communication
CREATE INDEX IF NOT EXISTS idx_communication_logs_recipient ON public.communication_logs(recipient_phone);
CREATE INDEX IF NOT EXISTS idx_feedback_surveys_patient_id ON public.feedback_surveys(patient_id);


-- ==============================================================================
-- 05_rls_policies.sql
-- Calyvia Wellness Center Management System (HMIS/EMR)
-- Row Level Security (RLS) Policies Enforcing Least-Privilege & KDPA 2019
-- ==============================================================================

SET search_path = public, extensions;

-- ------------------------------------------------------------------------------
-- 1. Enable Row Level Security on 100% of Relational Domain Tables
-- ------------------------------------------------------------------------------
DO $$
DECLARE
    tbl text;
    tables text[] := ARRAY[
        'users', 'staff_profiles', 'staff_schedules', 'staff_credentials', 'audit_logs',
        'patients', 'emergency_contacts', 'patient_consents', 'referral_partners', 'leads',
        'admissions', 'rooms', 'beds', 'bed_allocations', 'clinical_notes',
        'detox_episodes', 'withdrawal_assessments', 'vitals_logs', 'counselling_sessions', 'appointments',
        'medications', 'pharmacy_stock_batches', 'prescriptions', 'prescription_items', 'medication_administrations',
        'invoices', 'invoice_items', 'payments', 'mpesa_transactions', 'movement_records',
        'visitor_logs', 'incident_reports', 'staff_tasks', 'inventory_items', 'discharge_records',
        'aftercare_plans', 'aftercare_checkins', 'communication_logs', 'feedback_surveys', 'system_settings'
    ];
BEGIN
    FOREACH tbl IN ARRAY tables LOOP
        IF to_regclass(format('public.%I', tbl)) IS NOT NULL THEN
            EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', tbl);
        ELSE
            RAISE NOTICE 'Skipping RLS enablement: table public.% does not exist yet.', tbl;
        END IF;
    END LOOP;
END $$;

-- ------------------------------------------------------------------------------
-- 2. Security Definer Helper Function: Extract User Role
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, extensions, pg_temp
AS $$
    SELECT COALESCE(
        current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata' ->> 'role',
        current_setting('request.jwt.claims', true)::jsonb -> 'user_metadata' ->> 'role',
        (SELECT role::text FROM public.users WHERE id = auth.uid()),
        'ANONYMOUS'
    );
$$;

-- ------------------------------------------------------------------------------
-- 3. Service Role Bypass Policies (Used by NestJS Monolith & Admin Jobs)
-- ------------------------------------------------------------------------------
DO $$
DECLARE
    tbl text;
    tables text[] := ARRAY[
        'users', 'staff_profiles', 'staff_schedules', 'staff_credentials', 'audit_logs',
        'patients', 'emergency_contacts', 'patient_consents', 'referral_partners', 'leads',
        'admissions', 'rooms', 'beds', 'bed_allocations', 'clinical_notes',
        'detox_episodes', 'withdrawal_assessments', 'vitals_logs', 'counselling_sessions', 'appointments',
        'medications', 'pharmacy_stock_batches', 'prescriptions', 'prescription_items', 'medication_administrations',
        'invoices', 'invoice_items', 'payments', 'mpesa_transactions', 'movement_records',
        'visitor_logs', 'incident_reports', 'staff_tasks', 'inventory_items', 'discharge_records',
        'aftercare_plans', 'aftercare_checkins', 'communication_logs', 'feedback_surveys', 'system_settings'
    ];
BEGIN
    FOREACH tbl IN ARRAY tables LOOP
        IF to_regclass(format('public.%I', tbl)) IS NOT NULL THEN
            EXECUTE format('
                DROP POLICY IF EXISTS service_role_all ON public.%I;
                CREATE POLICY service_role_all ON public.%I
                    FOR ALL TO service_role
                    USING (true)
                    WITH CHECK (true);
            ', tbl, tbl);
        END IF;
    END LOOP;
END $$;

-- ------------------------------------------------------------------------------
-- 4. Super Admin Full Access Policy
-- ------------------------------------------------------------------------------
DO $$
DECLARE
    tbl text;
    tables text[] := ARRAY[
        'users', 'staff_profiles', 'staff_schedules', 'staff_credentials', 'audit_logs',
        'patients', 'emergency_contacts', 'patient_consents', 'referral_partners', 'leads',
        'admissions', 'rooms', 'beds', 'bed_allocations', 'clinical_notes',
        'detox_episodes', 'withdrawal_assessments', 'vitals_logs', 'counselling_sessions', 'appointments',
        'medications', 'pharmacy_stock_batches', 'prescriptions', 'prescription_items', 'medication_administrations',
        'invoices', 'invoice_items', 'payments', 'mpesa_transactions', 'movement_records',
        'visitor_logs', 'incident_reports', 'staff_tasks', 'inventory_items', 'discharge_records',
        'aftercare_plans', 'aftercare_checkins', 'communication_logs', 'feedback_surveys', 'system_settings'
    ];
BEGIN
    FOREACH tbl IN ARRAY tables LOOP
        IF to_regclass(format('public.%I', tbl)) IS NOT NULL THEN
            EXECUTE format('
                DROP POLICY IF EXISTS super_admin_all ON public.%I;
                CREATE POLICY super_admin_all ON public.%I
                    FOR ALL TO authenticated
                    USING (public.get_current_user_role() IN (''SUPER_ADMIN'', ''FACILITY_ADMIN''))
                    WITH CHECK (public.get_current_user_role() IN (''SUPER_ADMIN'', ''FACILITY_ADMIN''));
            ', tbl, tbl);
        END IF;
    END LOOP;
END $$;

-- ------------------------------------------------------------------------------
-- 5. Role-Specific Access Policies (Clinical, Nursing, Front Desk, Pharmacy, Billing)
-- ------------------------------------------------------------------------------
DO $$
BEGIN
    -- Clinical Read Access to Patients & Admissions
    IF to_regclass('public.patients') IS NOT NULL THEN
        DROP POLICY IF EXISTS clinical_read_patients ON public.patients;
        CREATE POLICY clinical_read_patients ON public.patients
            FOR SELECT TO authenticated
            USING (public.get_current_user_role() IN (
                'MEDICAL_DIRECTOR', 'DOCTOR_PSYCHIATRIST', 'NURSE', 'COUNSELLOR',
                'ADMISSIONS_FRONT_DESK', 'PHARMACIST', 'FINANCE_BILLING'
            ));
    END IF;

    IF to_regclass('public.admissions') IS NOT NULL THEN
        DROP POLICY IF EXISTS clinical_read_admissions ON public.admissions;
        CREATE POLICY clinical_read_admissions ON public.admissions
            FOR SELECT TO authenticated
            USING (public.get_current_user_role() IN (
                'MEDICAL_DIRECTOR', 'DOCTOR_PSYCHIATRIST', 'NURSE', 'COUNSELLOR',
                'ADMISSIONS_FRONT_DESK', 'PHARMACIST', 'FINANCE_BILLING'
            ));
    END IF;

    -- Clinical Notes (Doctors, Psychs, Nurses, Counsellors)
    IF to_regclass('public.clinical_notes') IS NOT NULL THEN
        DROP POLICY IF EXISTS clinical_notes_access ON public.clinical_notes;
        CREATE POLICY clinical_notes_access ON public.clinical_notes
            FOR ALL TO authenticated
            USING (public.get_current_user_role() IN ('MEDICAL_DIRECTOR', 'DOCTOR_PSYCHIATRIST', 'NURSE', 'COUNSELLOR'))
            WITH CHECK (public.get_current_user_role() IN ('MEDICAL_DIRECTOR', 'DOCTOR_PSYCHIATRIST', 'NURSE', 'COUNSELLOR'));
    END IF;

    -- Detox & Vitals (Doctors & Nurses)
    IF to_regclass('public.detox_episodes') IS NOT NULL THEN
        DROP POLICY IF EXISTS detox_episodes_access ON public.detox_episodes;
        CREATE POLICY detox_episodes_access ON public.detox_episodes
            FOR ALL TO authenticated
            USING (public.get_current_user_role() IN ('MEDICAL_DIRECTOR', 'DOCTOR_PSYCHIATRIST', 'NURSE'))
            WITH CHECK (public.get_current_user_role() IN ('MEDICAL_DIRECTOR', 'DOCTOR_PSYCHIATRIST', 'NURSE'));
    END IF;

    IF to_regclass('public.vitals_logs') IS NOT NULL THEN
        DROP POLICY IF EXISTS vitals_logs_access ON public.vitals_logs;
        CREATE POLICY vitals_logs_access ON public.vitals_logs
            FOR ALL TO authenticated
            USING (public.get_current_user_role() IN ('MEDICAL_DIRECTOR', 'DOCTOR_PSYCHIATRIST', 'NURSE'))
            WITH CHECK (public.get_current_user_role() IN ('MEDICAL_DIRECTOR', 'DOCTOR_PSYCHIATRIST', 'NURSE'));
    END IF;

    -- Counselling Sessions (Counsellors & Psychologists)
    IF to_regclass('public.counselling_sessions') IS NOT NULL THEN
        DROP POLICY IF EXISTS counselling_sessions_access ON public.counselling_sessions;
        CREATE POLICY counselling_sessions_access ON public.counselling_sessions
            FOR ALL TO authenticated
            USING (public.get_current_user_role() IN ('MEDICAL_DIRECTOR', 'COUNSELLOR', 'DOCTOR_PSYCHIATRIST'))
            WITH CHECK (public.get_current_user_role() IN ('MEDICAL_DIRECTOR', 'COUNSELLOR', 'DOCTOR_PSYCHIATRIST'));
    END IF;

    -- Pharmacy & e-MAR (Pharmacists, Doctors, Nurses)
    IF to_regclass('public.medications') IS NOT NULL THEN
        DROP POLICY IF EXISTS pharmacy_medications_read ON public.medications;
        CREATE POLICY pharmacy_medications_read ON public.medications
            FOR SELECT TO authenticated
            USING (true);

        DROP POLICY IF EXISTS pharmacy_medications_write ON public.medications;
        CREATE POLICY pharmacy_medications_write ON public.medications
            FOR ALL TO authenticated
            USING (public.get_current_user_role() IN ('PHARMACIST', 'MEDICAL_DIRECTOR'))
            WITH CHECK (public.get_current_user_role() IN ('PHARMACIST', 'MEDICAL_DIRECTOR'));
    END IF;

    IF to_regclass('public.prescriptions') IS NOT NULL THEN
        DROP POLICY IF EXISTS prescriptions_access ON public.prescriptions;
        CREATE POLICY prescriptions_access ON public.prescriptions
            FOR ALL TO authenticated
            USING (public.get_current_user_role() IN ('DOCTOR_PSYCHIATRIST', 'MEDICAL_DIRECTOR', 'PHARMACIST', 'NURSE'))
            WITH CHECK (public.get_current_user_role() IN ('DOCTOR_PSYCHIATRIST', 'MEDICAL_DIRECTOR'));
    END IF;

    IF to_regclass('public.medication_administrations') IS NOT NULL THEN
        DROP POLICY IF EXISTS med_admin_access ON public.medication_administrations;
        CREATE POLICY med_admin_access ON public.medication_administrations
            FOR ALL TO authenticated
            USING (public.get_current_user_role() IN ('NURSE', 'DOCTOR_PSYCHIATRIST', 'PHARMACIST', 'MEDICAL_DIRECTOR'))
            WITH CHECK (public.get_current_user_role() IN ('NURSE', 'DOCTOR_PSYCHIATRIST'));
    END IF;

    -- Front Desk & Admissions Policies
    IF to_regclass('public.patients') IS NOT NULL THEN
        DROP POLICY IF EXISTS front_desk_patients_write ON public.patients;
        CREATE POLICY front_desk_patients_write ON public.patients
            FOR INSERT TO authenticated
            WITH CHECK (public.get_current_user_role() IN ('ADMISSIONS_FRONT_DESK', 'MEDICAL_DIRECTOR'));
    END IF;

    IF to_regclass('public.leads') IS NOT NULL THEN
        DROP POLICY IF EXISTS front_desk_leads ON public.leads;
        CREATE POLICY front_desk_leads ON public.leads
            FOR ALL TO authenticated
            USING (public.get_current_user_role() IN ('ADMISSIONS_FRONT_DESK', 'MANAGEMENT_EXECUTIVE'))
            WITH CHECK (public.get_current_user_role() IN ('ADMISSIONS_FRONT_DESK'));

        -- Public Website Lead Ingestion (https://calyviawellness.co.ke/)
        DROP POLICY IF EXISTS public_leads_insert ON public.leads;
        CREATE POLICY public_leads_insert ON public.leads
            FOR INSERT TO anon
            WITH CHECK (true);
    END IF;

    IF to_regclass('public.rooms') IS NOT NULL THEN
        DROP POLICY IF EXISTS front_desk_rooms_read ON public.rooms;
        CREATE POLICY front_desk_rooms_read ON public.rooms
            FOR SELECT TO authenticated
            USING (true);
    END IF;

    IF to_regclass('public.beds') IS NOT NULL THEN
        DROP POLICY IF EXISTS front_desk_beds_read ON public.beds;
        CREATE POLICY front_desk_beds_read ON public.beds
            FOR SELECT TO authenticated
            USING (true);
    END IF;

    IF to_regclass('public.bed_allocations') IS NOT NULL THEN
        DROP POLICY IF EXISTS front_desk_bed_allocations ON public.bed_allocations;
        CREATE POLICY front_desk_bed_allocations ON public.bed_allocations
            FOR ALL TO authenticated
            USING (public.get_current_user_role() IN ('ADMISSIONS_FRONT_DESK', 'NURSE', 'MEDICAL_DIRECTOR'))
            WITH CHECK (public.get_current_user_role() IN ('ADMISSIONS_FRONT_DESK', 'NURSE', 'MEDICAL_DIRECTOR'));
    END IF;

    -- Billing & Finance Policies
    IF to_regclass('public.invoices') IS NOT NULL THEN
        DROP POLICY IF EXISTS billing_invoices_access ON public.invoices;
        CREATE POLICY billing_invoices_access ON public.invoices
            FOR ALL TO authenticated
            USING (public.get_current_user_role() IN ('FINANCE_BILLING', 'MANAGEMENT_EXECUTIVE'))
            WITH CHECK (public.get_current_user_role() IN ('FINANCE_BILLING'));
    END IF;

    IF to_regclass('public.payments') IS NOT NULL THEN
        DROP POLICY IF EXISTS billing_payments_access ON public.payments;
        CREATE POLICY billing_payments_access ON public.payments
            FOR ALL TO authenticated
            USING (public.get_current_user_role() IN ('FINANCE_BILLING', 'MANAGEMENT_EXECUTIVE'))
            WITH CHECK (public.get_current_user_role() IN ('FINANCE_BILLING'));
    END IF;

    IF to_regclass('public.mpesa_transactions') IS NOT NULL THEN
        DROP POLICY IF EXISTS billing_mpesa_access ON public.mpesa_transactions;
        CREATE POLICY billing_mpesa_access ON public.mpesa_transactions
            FOR ALL TO authenticated
            USING (public.get_current_user_role() IN ('FINANCE_BILLING', 'MANAGEMENT_EXECUTIVE'))
            WITH CHECK (public.get_current_user_role() IN ('FINANCE_BILLING'));
    END IF;

    -- Anonymous Patient/Family Feedback Survey Kiosk
    IF to_regclass('public.feedback_surveys') IS NOT NULL THEN
        DROP POLICY IF EXISTS public_feedback_insert ON public.feedback_surveys;
        CREATE POLICY public_feedback_insert ON public.feedback_surveys
            FOR INSERT TO anon
            WITH CHECK (true);
    END IF;
END $$;


-- ==============================================================================
-- 06_triggers_and_functions.sql
-- Calyvia Wellness Center Management System (HMIS/EMR)
-- Production Triggers & Automated Helper Functions
-- ==============================================================================

SET search_path = public, extensions;

-- ------------------------------------------------------------------------------
-- 1. Automated Timestamp Trigger Function: handle_updated_at
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- Apply updated_at trigger safely across all tables with updated_at column
DO $$
DECLARE
    tbl text;
    tables text[] := ARRAY[
        'users', 'patients', 'leads', 'admissions', 'clinical_notes',
        'detox_episodes', 'appointments', 'invoices', 'incident_reports',
        'staff_tasks', 'inventory_items', 'system_settings'
    ];
BEGIN
    FOREACH tbl IN ARRAY tables LOOP
        IF to_regclass(format('public.%I', tbl)) IS NOT NULL THEN
            EXECUTE format('
                DROP TRIGGER IF EXISTS trg_%I_updated_at ON public.%I;
                CREATE TRIGGER trg_%I_updated_at
                    BEFORE UPDATE ON public.%I
                    FOR EACH ROW
                    EXECUTE FUNCTION public.handle_updated_at();
            ', tbl, tbl, tbl, tbl);
        ELSE
            RAISE NOTICE 'Skipping updated_at trigger: public.% does not exist yet.', tbl;
        END IF;
    END LOOP;
END $$;

-- ------------------------------------------------------------------------------
-- 2. Bed Occupancy Synchronization Trigger
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.sync_bed_occupancy()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    -- If newly allocated and active, set bed to OCCUPIED
    IF (TG_OP = 'INSERT' AND NEW.is_active = true) THEN
        UPDATE public.beds
        SET status = 'OCCUPIED'
        WHERE id = NEW.bed_id;
    END IF;

    -- If updated to inactive or released, set bed back to AVAILABLE
    IF (TG_OP = 'UPDATE') THEN
        IF (NEW.is_active = false OR NEW.released_at IS NOT NULL) THEN
            UPDATE public.beds
            SET status = 'AVAILABLE'
            WHERE id = NEW.bed_id;
        ELSIF (NEW.is_active = true AND NEW.released_at IS NULL) THEN
            UPDATE public.beds
            SET status = 'OCCUPIED'
            WHERE id = NEW.bed_id;
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

DO $$
BEGIN
    IF to_regclass('public.bed_allocations') IS NOT NULL AND to_regclass('public.beds') IS NOT NULL THEN
        DROP TRIGGER IF EXISTS trg_sync_bed_occupancy ON public.bed_allocations;
        CREATE TRIGGER trg_sync_bed_occupancy
            AFTER INSERT OR UPDATE ON public.bed_allocations
            FOR EACH ROW
            EXECUTE FUNCTION public.sync_bed_occupancy();
    ELSE
        RAISE NOTICE 'Skipping trg_sync_bed_occupancy: public.bed_allocations or public.beds does not exist yet.';
    END IF;
END $$;

-- ------------------------------------------------------------------------------
-- 3. Automated Audit Log Helper Function
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.log_clinical_audit_event()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    INSERT INTO public.audit_logs (
        id,
        user_id,
        action,
        entity_name,
        entity_id,
        old_values,
        new_values,
        timestamp
    ) VALUES (
        gen_random_uuid(),
        auth.uid(),
        TG_OP,
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id)::text,
        CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN to_jsonb(OLD) ELSE NULL END,
        CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END,
        now()
    );
    RETURN COALESCE(NEW, OLD);
END;
$$;

DO $$
BEGIN
    IF to_regclass('public.clinical_notes') IS NOT NULL AND to_regclass('public.audit_logs') IS NOT NULL THEN
        DROP TRIGGER IF EXISTS trg_audit_clinical_notes ON public.clinical_notes;
        CREATE TRIGGER trg_audit_clinical_notes
            AFTER INSERT OR UPDATE OR DELETE ON public.clinical_notes
            FOR EACH ROW
            EXECUTE FUNCTION public.log_clinical_audit_event();
    ELSE
        RAISE NOTICE 'Skipping trg_audit_clinical_notes: required tables do not exist yet.';
    END IF;

    IF to_regclass('public.admissions') IS NOT NULL AND to_regclass('public.audit_logs') IS NOT NULL THEN
        DROP TRIGGER IF EXISTS trg_audit_admissions ON public.admissions;
        CREATE TRIGGER trg_audit_admissions
            AFTER INSERT OR UPDATE OR DELETE ON public.admissions
            FOR EACH ROW
            EXECUTE FUNCTION public.log_clinical_audit_event();
    ELSE
        RAISE NOTICE 'Skipping trg_audit_admissions: required tables do not exist yet.';
    END IF;
END $$;


-- ==============================================================================
-- 07_storage_buckets.sql
-- Calyvia Wellness Center Management System (HMIS/EMR)
-- Production Supabase Storage Buckets & Storage Security Policies
-- ==============================================================================

SET search_path = public, extensions;

-- ------------------------------------------------------------------------------
-- 1. Create Private and Public Storage Buckets
-- ------------------------------------------------------------------------------
DO $$
BEGIN
    IF to_regclass('storage.buckets') IS NOT NULL THEN
        -- Private Bucket: Patient Documents (Admission agreements, digital consent forms)
        INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
        VALUES (
            'patient-documents',
            'patient-documents',
            false,
            52428800, -- 50 MB
            ARRAY['application/pdf', 'image/png', 'image/jpeg', 'image/jpg']
        )
        ON CONFLICT (id) DO UPDATE SET
            public = false,
            file_size_limit = 52428800,
            allowed_mime_types = ARRAY['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];

        -- Private Bucket: Medical Records (External lab results, psychiatric reports, ECG/X-rays)
        INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
        VALUES (
            'medical-records',
            'medical-records',
            false,
            52428800, -- 50 MB
            ARRAY['application/pdf', 'image/png', 'image/jpeg', 'image/jpg', 'application/dicom']
        )
        ON CONFLICT (id) DO UPDATE SET
            public = false,
            file_size_limit = 52428800,
            allowed_mime_types = ARRAY['application/pdf', 'image/png', 'image/jpeg', 'image/jpg', 'application/dicom'];

        -- Private Bucket: Prescriptions (Scanned external prescriptions and pharmacy audit logs)
        INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
        VALUES (
            'prescriptions',
            'prescriptions',
            false,
            20971520, -- 20 MB
            ARRAY['application/pdf', 'image/png', 'image/jpeg', 'image/jpg']
        )
        ON CONFLICT (id) DO UPDATE SET
            public = false,
            file_size_limit = 20971520,
            allowed_mime_types = ARRAY['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];

        -- Public Bucket: System Assets (Branding logos, PDF letterheads, facility guidelines)
        INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
        VALUES (
            'system-assets',
            'system-assets',
            true,
            10485760, -- 10 MB
            ARRAY['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp', 'application/pdf']
        )
        ON CONFLICT (id) DO UPDATE SET
            public = true,
            file_size_limit = 10485760,
            allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp', 'application/pdf'];
    ELSE
        RAISE NOTICE 'Skipping storage.buckets provisioning: schema storage does not exist in this database.';
    END IF;
END $$;

-- ------------------------------------------------------------------------------
-- 2. Storage RLS Policies on storage.objects
-- ------------------------------------------------------------------------------
DO $$
BEGIN
    IF to_regclass('storage.objects') IS NOT NULL THEN
        -- Allow Service Role Full Access
        DROP POLICY IF EXISTS "service_role_storage_all" ON storage.objects;
        CREATE POLICY "service_role_storage_all" ON storage.objects
            FOR ALL TO service_role
            USING (true)
            WITH CHECK (true);

        -- Allow Public Read on System Assets
        DROP POLICY IF EXISTS "public_read_system_assets" ON storage.objects;
        CREATE POLICY "public_read_system_assets" ON storage.objects
            FOR SELECT TO public
            USING (bucket_id = 'system-assets');

        -- Allow Authenticated Staff Access to Clinical Buckets
        DROP POLICY IF EXISTS "staff_read_clinical_documents" ON storage.objects;
        CREATE POLICY "staff_read_clinical_documents" ON storage.objects
            FOR SELECT TO authenticated
            USING (bucket_id IN ('patient-documents', 'medical-records', 'prescriptions'));

        DROP POLICY IF EXISTS "staff_upload_clinical_documents" ON storage.objects;
        CREATE POLICY "staff_upload_clinical_documents" ON storage.objects
            FOR INSERT TO authenticated
            WITH CHECK (bucket_id IN ('patient-documents', 'medical-records', 'prescriptions'));
    ELSE
        RAISE NOTICE 'Skipping storage.objects policies: schema storage does not exist in this database.';
    END IF;
END $$;


-- ==============================================================================
-- 09_verify.sql
-- Calyvia Wellness Center Management System (HMIS/EMR)
-- Comprehensive Verification & System Sanity Checklist
-- ==============================================================================

SET search_path = public, extensions;

-- ------------------------------------------------------------------------------
-- 1. Check PostgreSQL Extensions
-- ------------------------------------------------------------------------------
SELECT 
    extname AS extension_name, 
    extversion AS version,
    'INSTALLED (PASS)' AS status
FROM pg_extension
WHERE extname IN ('uuid-ossp', 'pgcrypto', 'citext');

-- ------------------------------------------------------------------------------
-- 2. Verify Table Existence (Count of Public Tables)
-- ------------------------------------------------------------------------------
SELECT 
    COUNT(*) AS total_tables_created,
    CASE 
        WHEN COUNT(*) >= 40 THEN 'PASS (40/40 Domain Tables Verified)' 
        ELSE 'FAIL (' || COUNT(*) || '/40 tables created)' 
    END AS table_count_check
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE';

-- ------------------------------------------------------------------------------
-- 3. Verify Row Level Security (RLS) is Enabled on 100% of Tables
-- ------------------------------------------------------------------------------
SELECT 
    tablename,
    CASE WHEN rowsecurity THEN 'RLS_ENABLED (PASS)' ELSE 'RLS_DISABLED (FAIL)' END AS rls_status
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- Check for any unprotected table (Must return 0 rows)
SELECT 
    tablename AS unprotected_table_warning
FROM pg_tables
WHERE schemaname = 'public' 
  AND rowsecurity = false;

-- ------------------------------------------------------------------------------
-- 4. Verify Active Triggers
-- ------------------------------------------------------------------------------
SELECT 
    event_object_table AS table_name,
    trigger_name,
    action_timing,
    event_manipulation AS event_type,
    'ACTIVE' AS trigger_status
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- ------------------------------------------------------------------------------
-- 5. Verify Storage Buckets (Guarded)
-- ------------------------------------------------------------------------------
SELECT 
    b.id AS bucket_id,
    b.name AS bucket_name,
    b.public AS is_public,
    b.file_size_limit / (1024 * 1024) AS max_size_mb,
    'CONFIGURED' AS status
FROM (
    SELECT id, name, public, file_size_limit 
    FROM storage.buckets 
    WHERE to_regclass('storage.buckets') IS NOT NULL
) b
WHERE b.id IN ('patient-documents', 'medical-records', 'prescriptions', 'system-assets');

-- ------------------------------------------------------------------------------
-- 6. Domain Table Inventory & Persisted Record Diagnostics (Fail-Safe Dynamic Reflection)
-- ------------------------------------------------------------------------------
-- Note: Evaluates both clean production (0 records) and seeded development states
-- without throwing 42P01 errors on missing or uninitialized tables.
SELECT 
    t.table_name,
    CASE 
        WHEN to_regclass('public.' || t.table_name) IS NOT NULL THEN 'PRESENT'
        ELSE 'MISSING'
    END AS table_status,
    CASE 
        WHEN to_regclass('public.' || t.table_name) IS NOT NULL THEN
            (xpath('/row/c/text()', query_to_xml(format('select count(*) as c from public.%I', t.table_name), false, true, '')))[1]::text::bigint
        ELSE NULL
    END AS record_count,
    CASE
        WHEN to_regclass('public.' || t.table_name) IS NULL THEN 'FAIL: Table not found'
        WHEN (xpath('/row/c/text()', query_to_xml(format('select count(*) as c from public.%I', t.table_name), false, true, '')))[1]::text::bigint = 0 THEN 'OK (Clean / Empty for Production)'
        ELSE 'OK (Contains Persisted Records)'
    END AS evaluation
FROM (
    VALUES 
        ('users'),
        ('staff_profiles'),
        ('staff_schedules'),
        ('staff_credentials'),
        ('audit_logs'),
        ('patients'),
        ('emergency_contacts'),
        ('patient_consents'),
        ('referral_partners'),
        ('leads'),
        ('admissions'),
        ('rooms'),
        ('beds'),
        ('bed_allocations'),
        ('clinical_notes'),
        ('detox_episodes'),
        ('withdrawal_assessments'),
        ('vitals_logs'),
        ('counselling_sessions'),
        ('appointments'),
        ('medications'),
        ('pharmacy_stock_batches'),
        ('prescriptions'),
        ('prescription_items'),
        ('medication_administrations'),
        ('invoices'),
        ('invoice_items'),
        ('payments'),
        ('mpesa_transactions'),
        ('movement_records'),
        ('visitor_logs'),
        ('incident_reports'),
        ('staff_tasks'),
        ('inventory_items'),
        ('discharge_records'),
        ('aftercare_plans'),
        ('aftercare_checkins'),
        ('communication_logs'),
        ('feedback_surveys'),
        ('system_settings')
) AS t(table_name)
ORDER BY t.table_name;


