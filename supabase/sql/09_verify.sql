-- ==============================================================================
-- 09_verify.sql
-- Calyvia Wellness Center Management System (HMIS/EMR)
-- Comprehensive Verification & System Sanity Checklist
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. Check PostgreSQL Extensions
-- ------------------------------------------------------------------------------
SELECT 
    extname AS extension_name, 
    extversion AS version,
    'INSTALLED' AS status
FROM pg_extension
WHERE extname IN ('uuid-ossp', 'pgcrypto', 'citext');

-- ------------------------------------------------------------------------------
-- 2. Verify Table Existence (Count of Public Tables)
-- ------------------------------------------------------------------------------
SELECT 
    COUNT(*) AS total_tables_created,
    CASE WHEN COUNT(*) >= 40 THEN 'PASS (>=40 tables)' ELSE 'FAIL (<40 tables)' END AS table_count_check
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
-- 5. Verify Storage Buckets
-- ------------------------------------------------------------------------------
SELECT 
    id AS bucket_id,
    name AS bucket_name,
    public AS is_public,
    file_size_limit / (1024 * 1024) AS max_size_mb,
    'CONFIGURED' AS status
FROM storage.buckets
WHERE id IN ('patient-documents', 'medical-records', 'prescriptions', 'system-assets');

-- ------------------------------------------------------------------------------
-- 6. Synthetic Seed Record Counts
-- ------------------------------------------------------------------------------
SELECT 'users' AS table_name, count(*) AS synthetic_records FROM public.users
UNION ALL
SELECT 'staff_profiles', count(*) FROM public.staff_profiles
UNION ALL
SELECT 'rooms', count(*) FROM public.rooms
UNION ALL
SELECT 'beds', count(*) FROM public.beds
UNION ALL
SELECT 'patients', count(*) FROM public.patients
UNION ALL
SELECT 'admissions', count(*) FROM public.admissions
UNION ALL
SELECT 'bed_allocations', count(*) FROM public.bed_allocations
UNION ALL
SELECT 'clinical_notes', count(*) FROM public.clinical_notes
UNION ALL
SELECT 'detox_episodes', count(*) FROM public.detox_episodes
UNION ALL
SELECT 'medications', count(*) FROM public.medications
UNION ALL
SELECT 'invoices', count(*) FROM public.invoices
UNION ALL
SELECT 'payments', count(*) FROM public.payments
UNION ALL
SELECT 'system_settings', count(*) FROM public.system_settings;
