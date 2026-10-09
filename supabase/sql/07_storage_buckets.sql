-- ==============================================================================
-- 07_storage_buckets.sql
-- Calyvia Wellness Center Management System (HMIS/EMR)
-- Production Supabase Storage Buckets & Storage Security Policies
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. Create Private and Public Storage Buckets
-- ------------------------------------------------------------------------------

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

-- ------------------------------------------------------------------------------
-- 2. Storage RLS Policies on storage.objects
-- ------------------------------------------------------------------------------

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
