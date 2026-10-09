# Calyvia Wellness Center — Supabase SQL Editor Deployment Guide

**Target Environment:** Supabase Cloud / Self-Hosted Supabase PostgreSQL 16  
**Compliance Standard:** Kenya Data Protection Act, 2019 (KDPA Sections 44–47)  
**Data Policy:** Strictly Synthetic Clinical and Patient Data for Testing. ZERO Real Patient Information.  

---

## 1. Overview & Execution Order

These SQL scripts are structured to be pasted directly into the **Supabase Dashboard SQL Editor** in strict numerical order. Each script is idempotent and handles dependency creation in order:

| Step | Script File | Purpose | Notes |
|:--|:--|:--|:--|
| **01** | [`01_extensions.sql`](file:///c:/xampp/htdocs/Calyvia/supabase/sql/01_extensions.sql) | Enables required PostgreSQL extensions | `uuid-ossp`, `pgcrypto`, `citext` |
| **02** | [`02_types_and_enums.sql`](file:///c:/xampp/htdocs/Calyvia/supabase/sql/02_types_and_enums.sql) | Creates all custom domain ENUM types | 15 clinical & operational ENUMs |
| **03** | [`03_tables.sql`](file:///c:/xampp/htdocs/Calyvia/supabase/sql/03_tables.sql) | DDL for all 41 domain tables | Foreign keys, defaults, timestamps |
| **04** | [`04_indexes.sql`](file:///c:/xampp/htdocs/Calyvia/supabase/sql/04_indexes.sql) | Performance & query indexes | B-tree indexes on FKs & search fields |
| **05** | [`05_rls_policies.sql`](file:///c:/xampp/htdocs/Calyvia/supabase/sql/05_rls_policies.sql) | Row Level Security (RLS) enforcement | 100% table coverage + least-privilege |
| **06** | [`06_triggers_and_functions.sql`](file:///c:/xampp/htdocs/Calyvia/supabase/sql/06_triggers_and_functions.sql) | Automated triggers and helper functions | `updated_at`, audit trail, bed sync |
| **07** | [`07_storage_buckets.sql`](file:///c:/xampp/htdocs/Calyvia/supabase/sql/07_storage_buckets.sql) | Storage buckets & storage RLS policies | `patient-documents`, `medical-records`, etc. |
| **08** | [`08_seed_synthetic_data.sql`](file:///c:/xampp/htdocs/Calyvia/supabase/sql/08_seed_synthetic_data.sql) | Inserts synthetic test dataset | Fictitious staff, patients, beds, billing |
| **09** | [`09_verify.sql`](file:///c:/xampp/htdocs/Calyvia/supabase/sql/09_verify.sql) | Verification and sanity queries | Verifies table counts, RLS, triggers |
| **99** | [`99_reset_dev_only.sql`](file:///c:/xampp/htdocs/Calyvia/supabase/sql/99_reset_dev_only.sql) | Teardown & clean reset script | **DEVELOPMENT / STAGING ONLY** |

---

## 2. Execution Instructions via Supabase SQL Editor

1. Open your Supabase project dashboard at `https://supabase.com/dashboard/project/<your-project-ref>`.
2. Navigate to **SQL Editor** in the left sidebar.
3. Open a **New Query**.
4. Paste the contents of `01_extensions.sql` and click **Run**.
5. Repeat sequentially for `02` through `08`.
6. Run `09_verify.sql` to confirm that all 41 tables exist, Row Level Security is enabled on every table, triggers are operational, and synthetic records are populated.

---

## 3. Important Safety Notes

- **Never run `99_reset_dev_only.sql` on a production database.** The reset script contains a safety check (`IF current_database() = 'production' THEN RAISE EXCEPTION ...`), but caution is essential.
- **Service Role Key:** In Option A (Hybrid Architecture), the NestJS API uses the PostgreSQL connection string with full transaction capabilities. The `service_role` has bypass privileges configured in `05_rls_policies.sql` to facilitate API queries.
- **Sensitive Data Notice:** In accordance with the Kenya Data Protection Act 2019, all clinical narratives (substance histories, diagnoses, notes) in `08_seed_synthetic_data.sql` are strictly synthetic. Production data must be encrypted with AES-256-GCM prior to storage.
