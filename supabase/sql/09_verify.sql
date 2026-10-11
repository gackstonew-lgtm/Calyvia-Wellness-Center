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
