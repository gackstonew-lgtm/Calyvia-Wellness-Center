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
