-- ==============================================================================
-- 01_extensions.sql
-- Calyvia Wellness Center Management System (HMIS/EMR)
-- Idempotent PostgreSQL Extensions Setup
-- ==============================================================================

-- Enable UUID generator (v4)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;

-- Enable cryptographic primitives (for password hashing and digest calculations)
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA extensions;

-- Enable case-insensitive text type (for emails, national IDs, and lookups)
CREATE EXTENSION IF NOT EXISTS "citext" WITH SCHEMA extensions;

-- Confirm extensions are active
DO $$
BEGIN
    RAISE NOTICE 'Extensions uuid-ossp, pgcrypto, citext successfully verified.';
END $$;
