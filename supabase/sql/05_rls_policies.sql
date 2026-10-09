-- ==============================================================================
-- 05_rls_policies.sql
-- Calyvia Wellness Center Management System (HMIS/EMR)
-- Row Level Security (RLS) Policies Enforcing Least-Privilege & KDPA 2019
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. Enable Row Level Security on 100% of Relational Tables
-- ------------------------------------------------------------------------------
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.beds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bed_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinical_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.detox_episodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawal_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vitals_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.counselling_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pharmacy_stock_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescription_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medication_administrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mpesa_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movement_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visitor_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incident_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discharge_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aftercare_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aftercare_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communication_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback_surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- 2. Security Definer Helper Function: Extract User Role
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
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
        EXECUTE format('
            DROP POLICY IF EXISTS service_role_all ON public.%I;
            CREATE POLICY service_role_all ON public.%I
                FOR ALL TO service_role
                USING (true)
                WITH CHECK (true);
        ', tbl, tbl);
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
        EXECUTE format('
            DROP POLICY IF EXISTS super_admin_all ON public.%I;
            CREATE POLICY super_admin_all ON public.%I
                FOR ALL TO authenticated
                USING (public.get_current_user_role() IN (''SUPER_ADMIN'', ''FACILITY_ADMIN''))
                WITH CHECK (public.get_current_user_role() IN (''SUPER_ADMIN'', ''FACILITY_ADMIN''));
        ', tbl, tbl);
    END LOOP;
END $$;

-- ------------------------------------------------------------------------------
-- 5. Clinical Staff Policies (Medical Director, Doctors, Nurses, Counsellors)
-- ------------------------------------------------------------------------------
-- Clinical Read Access to Patients & Admissions
CREATE POLICY clinical_read_patients ON public.patients
    FOR SELECT TO authenticated
    USING (public.get_current_user_role() IN (
        'MEDICAL_DIRECTOR', 'DOCTOR_PSYCHIATRIST', 'NURSE', 'COUNSELLOR',
        'ADMISSIONS_FRONT_DESK', 'PHARMACIST', 'FINANCE_BILLING'
    ));

CREATE POLICY clinical_read_admissions ON public.admissions
    FOR SELECT TO authenticated
    USING (public.get_current_user_role() IN (
        'MEDICAL_DIRECTOR', 'DOCTOR_PSYCHIATRIST', 'NURSE', 'COUNSELLOR',
        'ADMISSIONS_FRONT_DESK', 'PHARMACIST', 'FINANCE_BILLING'
    ));

-- Clinical Notes (Doctors, Psychs, Nurses, Counsellors)
CREATE POLICY clinical_notes_access ON public.clinical_notes
    FOR ALL TO authenticated
    USING (public.get_current_user_role() IN ('MEDICAL_DIRECTOR', 'DOCTOR_PSYCHIATRIST', 'NURSE', 'COUNSELLOR'))
    WITH CHECK (public.get_current_user_role() IN ('MEDICAL_DIRECTOR', 'DOCTOR_PSYCHIATRIST', 'NURSE', 'COUNSELLOR'));

-- Detox & Vitals (Doctors & Nurses)
CREATE POLICY detox_episodes_access ON public.detox_episodes
    FOR ALL TO authenticated
    USING (public.get_current_user_role() IN ('MEDICAL_DIRECTOR', 'DOCTOR_PSYCHIATRIST', 'NURSE'))
    WITH CHECK (public.get_current_user_role() IN ('MEDICAL_DIRECTOR', 'DOCTOR_PSYCHIATRIST', 'NURSE'));

CREATE POLICY vitals_logs_access ON public.vitals_logs
    FOR ALL TO authenticated
    USING (public.get_current_user_role() IN ('MEDICAL_DIRECTOR', 'DOCTOR_PSYCHIATRIST', 'NURSE'))
    WITH CHECK (public.get_current_user_role() IN ('MEDICAL_DIRECTOR', 'DOCTOR_PSYCHIATRIST', 'NURSE'));

-- Counselling Sessions (Counsellors & Psychologists)
CREATE POLICY counselling_sessions_access ON public.counselling_sessions
    FOR ALL TO authenticated
    USING (public.get_current_user_role() IN ('MEDICAL_DIRECTOR', 'COUNSELLOR', 'DOCTOR_PSYCHIATRIST'))
    WITH CHECK (public.get_current_user_role() IN ('MEDICAL_DIRECTOR', 'COUNSELLOR', 'DOCTOR_PSYCHIATRIST'));

-- Pharmacy & e-MAR (Pharmacists, Doctors, Nurses)
CREATE POLICY pharmacy_medications_read ON public.medications
    FOR SELECT TO authenticated
    USING (true);

CREATE POLICY pharmacy_medications_write ON public.medications
    FOR ALL TO authenticated
    USING (public.get_current_user_role() IN ('PHARMACIST', 'MEDICAL_DIRECTOR'))
    WITH CHECK (public.get_current_user_role() IN ('PHARMACIST', 'MEDICAL_DIRECTOR'));

CREATE POLICY prescriptions_access ON public.prescriptions
    FOR ALL TO authenticated
    USING (public.get_current_user_role() IN ('DOCTOR_PSYCHIATRIST', 'MEDICAL_DIRECTOR', 'PHARMACIST', 'NURSE'))
    WITH CHECK (public.get_current_user_role() IN ('DOCTOR_PSYCHIATRIST', 'MEDICAL_DIRECTOR'));

CREATE POLICY med_admin_access ON public.medication_administrations
    FOR ALL TO authenticated
    USING (public.get_current_user_role() IN ('NURSE', 'DOCTOR_PSYCHIATRIST', 'PHARMACIST', 'MEDICAL_DIRECTOR'))
    WITH CHECK (public.get_current_user_role() IN ('NURSE', 'DOCTOR_PSYCHIATRIST'));

-- ------------------------------------------------------------------------------
-- 6. Front Desk & Admissions Policies
-- ------------------------------------------------------------------------------
CREATE POLICY front_desk_patients_write ON public.patients
    FOR INSERT TO authenticated
    WITH CHECK (public.get_current_user_role() IN ('ADMISSIONS_FRONT_DESK', 'MEDICAL_DIRECTOR'));

CREATE POLICY front_desk_leads ON public.leads
    FOR ALL TO authenticated
    USING (public.get_current_user_role() IN ('ADMISSIONS_FRONT_DESK', 'MANAGEMENT_EXECUTIVE'))
    WITH CHECK (public.get_current_user_role() IN ('ADMISSIONS_FRONT_DESK'));

CREATE POLICY front_desk_rooms_read ON public.rooms
    FOR SELECT TO authenticated
    USING (true);

CREATE POLICY front_desk_beds_read ON public.beds
    FOR SELECT TO authenticated
    USING (true);

CREATE POLICY front_desk_bed_allocations ON public.bed_allocations
    FOR ALL TO authenticated
    USING (public.get_current_user_role() IN ('ADMISSIONS_FRONT_DESK', 'NURSE', 'MEDICAL_DIRECTOR'))
    WITH CHECK (public.get_current_user_role() IN ('ADMISSIONS_FRONT_DESK', 'NURSE', 'MEDICAL_DIRECTOR'));

-- ------------------------------------------------------------------------------
-- 7. Billing & Finance Policies
-- ------------------------------------------------------------------------------
CREATE POLICY billing_invoices_access ON public.invoices
    FOR ALL TO authenticated
    USING (public.get_current_user_role() IN ('FINANCE_BILLING', 'MANAGEMENT_EXECUTIVE'))
    WITH CHECK (public.get_current_user_role() IN ('FINANCE_BILLING'));

CREATE POLICY billing_payments_access ON public.payments
    FOR ALL TO authenticated
    USING (public.get_current_user_role() IN ('FINANCE_BILLING', 'MANAGEMENT_EXECUTIVE'))
    WITH CHECK (public.get_current_user_role() IN ('FINANCE_BILLING'));

CREATE POLICY billing_mpesa_access ON public.mpesa_transactions
    FOR ALL TO authenticated
    USING (public.get_current_user_role() IN ('FINANCE_BILLING', 'MANAGEMENT_EXECUTIVE'))
    WITH CHECK (public.get_current_user_role() IN ('FINANCE_BILLING'));

-- ------------------------------------------------------------------------------
-- 8. Public / Anonymous Access Policies (Website Leads & Feedback Surveys)
-- ------------------------------------------------------------------------------
-- Public Website Lead Ingestion (https://calyviawellness.co.ke/)
DROP POLICY IF EXISTS public_leads_insert ON public.leads;
CREATE POLICY public_leads_insert ON public.leads
    FOR INSERT TO anon
    WITH CHECK (true);

-- Anonymous Patient/Family Feedback Survey Kiosk
DROP POLICY IF EXISTS public_feedback_insert ON public.feedback_surveys;
CREATE POLICY public_feedback_insert ON public.feedback_surveys
    FOR INSERT TO anon
    WITH CHECK (true);
