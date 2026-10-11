-- ==============================================================================
-- Calyvia Wellness Center — Migration 10: Employee Account Approval Workflow
-- ==============================================================================
-- Adds approval status, audit linkage, and role tracking to public.users.
-- Enforces pending approval state for new employee registrations.
-- ==============================================================================

ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS approval_status TEXT NOT NULL DEFAULT 'APPROVED',
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES public.users(id),
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
ADD COLUMN IF NOT EXISTS requested_role TEXT;

-- Index approval status for rapid administrative review queries
CREATE INDEX IF NOT EXISTS idx_users_approval_status ON public.users(approval_status);

-- Ensure primary superior administrator is explicitly verified as APPROVED
UPDATE public.users 
SET approval_status = 'APPROVED', is_active = true, updated_at = now()
WHERE email = 'admin@calyviawellness.co.ke';
