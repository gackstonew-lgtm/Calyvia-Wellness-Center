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
