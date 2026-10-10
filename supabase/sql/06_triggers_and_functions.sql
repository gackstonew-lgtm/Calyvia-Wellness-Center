-- ==============================================================================
-- 06_triggers_and_functions.sql
-- Calyvia Wellness Center Management System (HMIS/EMR)
-- Production Triggers & Automated Helper Functions
-- ==============================================================================

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

-- Apply updated_at trigger across all tables with updated_at column
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
        EXECUTE format('
            DROP TRIGGER IF EXISTS trg_%I_updated_at ON public.%I;
            CREATE TRIGGER trg_%I_updated_at
                BEFORE UPDATE ON public.%I
                FOR EACH ROW
                EXECUTE FUNCTION public.handle_updated_at();
        ', tbl, tbl, tbl, tbl);
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

DROP TRIGGER IF EXISTS trg_sync_bed_occupancy ON public.bed_allocations;
CREATE TRIGGER trg_sync_bed_occupancy
    AFTER INSERT OR UPDATE ON public.bed_allocations
    FOR EACH ROW
    EXECUTE FUNCTION public.sync_bed_occupancy();

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

-- Apply audit trigger on high-sensitivity tables
DROP TRIGGER IF EXISTS trg_audit_clinical_notes ON public.clinical_notes;
CREATE TRIGGER trg_audit_clinical_notes
    AFTER INSERT OR UPDATE OR DELETE ON public.clinical_notes
    FOR EACH ROW
    EXECUTE FUNCTION public.log_clinical_audit_event();

DROP TRIGGER IF EXISTS trg_audit_admissions ON public.admissions;
CREATE TRIGGER trg_audit_admissions
    AFTER INSERT OR UPDATE OR DELETE ON public.admissions
    FOR EACH ROW
    EXECUTE FUNCTION public.log_clinical_audit_event();
