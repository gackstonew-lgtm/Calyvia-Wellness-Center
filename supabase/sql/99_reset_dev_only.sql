-- ==============================================================================
-- 99_reset_dev_only.sql
-- Calyvia Wellness Center Management System (HMIS/EMR)
-- Development & Staging Environment Clean Teardown Script
-- ==============================================================================
--
-- CAUTION: RUN THIS SCRIPT ONLY IN NON-PRODUCTION (LOCAL / DEV / STAGING).
-- WILL DROP ALL DOMAIN TABLES, POLICIES, FUNCTIONS, AND CUSTOM ENUM TYPES.
-- ==============================================================================

-- 1. Hard Production Safety Guard
DO $$
BEGIN
    IF current_database() IN ('production', 'calyvia_prod', 'postgres_prod') 
       OR current_database() ILIKE '%prod%' THEN
        RAISE EXCEPTION 'FATAL SAFETY ABORT: 99_reset_dev_only.sql cannot be executed on production database %', current_database();
    END IF;
END $$;

-- 2. Drop Relational Domain Tables (Reverse Dependency Order with CASCADE)
DROP TABLE IF EXISTS public.system_settings CASCADE;
DROP TABLE IF EXISTS public.feedback_surveys CASCADE;
DROP TABLE IF EXISTS public.communication_logs CASCADE;
DROP TABLE IF EXISTS public.aftercare_checkins CASCADE;
DROP TABLE IF EXISTS public.aftercare_plans CASCADE;
DROP TABLE IF EXISTS public.discharge_records CASCADE;
DROP TABLE IF EXISTS public.inventory_items CASCADE;
DROP TABLE IF EXISTS public.staff_tasks CASCADE;
DROP TABLE IF EXISTS public.incident_reports CASCADE;
DROP TABLE IF EXISTS public.visitor_logs CASCADE;
DROP TABLE IF EXISTS public.movement_records CASCADE;
DROP TABLE IF EXISTS public.mpesa_transactions CASCADE;
DROP TABLE IF EXISTS public.payments CASCADE;
DROP TABLE IF EXISTS public.invoice_items CASCADE;
DROP TABLE IF EXISTS public.invoices CASCADE;
DROP TABLE IF EXISTS public.medication_administrations CASCADE;
DROP TABLE IF EXISTS public.prescription_items CASCADE;
DROP TABLE IF EXISTS public.prescriptions CASCADE;
DROP TABLE IF EXISTS public.pharmacy_stock_batches CASCADE;
DROP TABLE IF EXISTS public.medications CASCADE;
DROP TABLE IF EXISTS public.appointments CASCADE;
DROP TABLE IF EXISTS public.counselling_sessions CASCADE;
DROP TABLE IF EXISTS public.vitals_logs CASCADE;
DROP TABLE IF EXISTS public.withdrawal_assessments CASCADE;
DROP TABLE IF EXISTS public.detox_episodes CASCADE;
DROP TABLE IF EXISTS public.clinical_notes CASCADE;
DROP TABLE IF EXISTS public.bed_allocations CASCADE;
DROP TABLE IF EXISTS public.beds CASCADE;
DROP TABLE IF EXISTS public.rooms CASCADE;
DROP TABLE IF EXISTS public.admissions CASCADE;
DROP TABLE IF EXISTS public.leads CASCADE;
DROP TABLE IF EXISTS public.referral_partners CASCADE;
DROP TABLE IF EXISTS public.patient_consents CASCADE;
DROP TABLE IF EXISTS public.emergency_contacts CASCADE;
DROP TABLE IF EXISTS public.patients CASCADE;
DROP TABLE IF EXISTS public.audit_logs CASCADE;
DROP TABLE IF EXISTS public.staff_credentials CASCADE;
DROP TABLE IF EXISTS public.staff_schedules CASCADE;
DROP TABLE IF EXISTS public.staff_profiles CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- 3. Drop Custom Functions
DROP FUNCTION IF EXISTS public.get_current_user_role() CASCADE;
DROP FUNCTION IF EXISTS public.handle_updated_at() CASCADE;
DROP FUNCTION IF EXISTS public.sync_bed_occupancy() CASCADE;
DROP FUNCTION IF EXISTS public.log_clinical_audit_event() CASCADE;

-- 4. Drop Custom ENUM Types
DROP TYPE IF EXISTS "TaskStatus" CASCADE;
DROP TYPE IF EXISTS "TaskPriority" CASCADE;
DROP TYPE IF EXISTS "IncidentSeverity" CASCADE;
DROP TYPE IF EXISTS "PaymentMethod" CASCADE;
DROP TYPE IF EXISTS "InvoiceStatus" CASCADE;
DROP TYPE IF EXISTS "BedStatus" CASCADE;
DROP TYPE IF EXISTS "RoomType" CASCADE;
DROP TYPE IF EXISTS "AssessmentSeverity" CASCADE;
DROP TYPE IF EXISTS "ScoreType" CASCADE;
DROP TYPE IF EXISTS "DetoxProtocolType" CASCADE;
DROP TYPE IF EXISTS "NoteType" CASCADE;
DROP TYPE IF EXISTS "ProgramType" CASCADE;
DROP TYPE IF EXISTS "AdmissionType" CASCADE;
DROP TYPE IF EXISTS "Gender" CASCADE;
DROP TYPE IF EXISTS "PatientStatus" CASCADE;
DROP TYPE IF EXISTS "UserRole" CASCADE;

-- 5. Confirmation Notice
DO $$
BEGIN
    RAISE NOTICE 'SUCCESS: Development environment schema cleanly reset.';
END $$;
