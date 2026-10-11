# Calyvia Wellness Center — Supabase PostgreSQL Architecture & Deployment Guide

**Target Environment:** Hosted Supabase Cloud / Self-Hosted Supabase PostgreSQL 16  
**Compliance Standard:** Kenya Data Protection Act, 2019 (KDPA Sections 44–47)  
**Security Architecture:** AES-256-GCM clinical narrative encryption, Argon2id authentication, 100% RLS table coverage, role-based authorization  
**Domain Table Count:** Exactly 40 Relational Domain Tables mapped to NestJS `ModelRepository`  

---

## 1. Overview & Script Inventory

The Calyvia HMIS/EMR database is structured into sequential, idempotent SQL scripts designed for direct execution in the **Supabase Dashboard SQL Editor** or via automated CI/CD migration runners:

| Step | Script File | Purpose | Idempotency & Safety Guarantees |
|:--|:--|:--|:--|
| **00** | [`00_master_init_calyvia_database.sql`](file:///c:/xampp/htdocs/Calyvia/supabase/sql/00_master_init_calyvia_database.sql) | **Monolithic Master Script** — Complete schema init (01–07 + 09) | Safe for single-paste production execution. Produces a clean zero-record baseline. |
| **01** | [`01_extensions.sql`](file:///c:/xampp/htdocs/Calyvia/supabase/sql/01_extensions.sql) | PostgreSQL Extensions Setup | Enables `uuid-ossp`, `pgcrypto`, `citext`; sets session and DB search path. |
| **02** | [`02_types_and_enums.sql`](file:///c:/xampp/htdocs/Calyvia/supabase/sql/02_types_and_enums.sql) | Custom Domain ENUM Types | Defines 16 custom ENUMs with `duplicate_object` exception guards. |
| **03** | [`03_tables.sql`](file:///c:/xampp/htdocs/Calyvia/supabase/sql/03_tables.sql) | DDL for all 40 Domain Tables | Topological DAG order; includes approval workflow columns on `users`. |
| **04** | [`04_indexes.sql`](file:///c:/xampp/htdocs/Calyvia/supabase/sql/04_indexes.sql) | Performance & Search Indexes | B-tree indexes on foreign keys, status fields, search filters, and approval state. |
| **05** | [`05_rls_policies.sql`](file:///c:/xampp/htdocs/Calyvia/supabase/sql/05_rls_policies.sql) | Row Level Security (RLS) Policies | `to_regclass` guarded; 100% table coverage; `service_role` + role-based rules. |
| **06** | [`06_triggers_and_functions.sql`](file:///c:/xampp/htdocs/Calyvia/supabase/sql/06_triggers_and_functions.sql) | Triggers & Helper Functions | `handle_updated_at`, bed sync, clinical audit; guarded against missing tables. |
| **07** | [`07_storage_buckets.sql`](file:///c:/xampp/htdocs/Calyvia/supabase/sql/07_storage_buckets.sql) | Supabase Storage Buckets | Creates buckets + storage object RLS; guarded against non-storage environments. |
| **08** | [`08_seed_synthetic_data.sql`](file:///c:/xampp/htdocs/Calyvia/supabase/sql/08_seed_synthetic_data.sql) | **Optional Test Seed Record Dataset** | **DEV/STAGING ONLY**. Synthetic Kenyan test records (Zero real patient PII). |
| **09** | [`09_verify.sql`](file:///c:/xampp/htdocs/Calyvia/supabase/sql/09_verify.sql) | System Sanity & Verification | Catalog-based dynamic diagnostics; never fails on empty or missing tables. |
| **10** | [`10_employee_approval_workflow.sql`](file:///c:/xampp/htdocs/Calyvia/supabase/sql/10_employee_approval_workflow.sql) | Incremental Migration | Reconciles approval columns on pre-existing users installations. |
| **99** | [`99_reset_dev_only.sql`](file:///c:/xampp/htdocs/Calyvia/supabase/sql/99_reset_dev_only.sql) | Clean Teardown & Reset | **NON-PRODUCTION ONLY**. Drops tables in reverse DAG order with prod guard. |

---

## 2. Production Deployment Instructions

For **Production Environments**, business tables MUST start empty. Persisted business records will be entered by authorized staff:

### Option A: Single Master Script (Recommended for Supabase SQL Editor)
1. Open Supabase Dashboard -> **SQL Editor** -> **New query**.
2. Paste the full contents of [`00_master_init_calyvia_database.sql`](file:///c:/xampp/htdocs/Calyvia/supabase/sql/00_master_init_calyvia_database.sql).
3. Click **Run**.
4. Review the returned result tabs:
   - Extensions: PASS (3/3)
   - Table count: PASS (40/40 domain tables)
   - RLS security: 100% enabled
   - Table inventory: All 40 tables report `PRESENT` and `OK (Clean / Empty for Production)`.
5. Provision the Primary Superior Administrator:
   ```bash
   npm run provision:admin -- --email="admin@calyviawellness.co.ke" --name="Antony Kariuki"
   ```

### Option B: Modular Sequential Execution
Execute scripts in strict numerical order:
1. `01_extensions.sql`
2. `02_types_and_enums.sql`
3. `03_tables.sql`
4. `04_indexes.sql`
5. `05_rls_policies.sql`
6. `06_triggers_and_functions.sql`
7. `07_storage_buckets.sql`
8. `09_verify.sql`

---

## 3. Development / Staging Test Seeding

To populate realistic synthetic data for UAT, load testing, or frontend development:
1. Complete steps 01 through 07.
2. Execute [`08_seed_synthetic_data.sql`](file:///c:/xampp/htdocs/Calyvia/supabase/sql/08_seed_synthetic_data.sql).
3. Execute `09_verify.sql` — rows will now report `OK (Contains Persisted Records)`.

---

## 4. Key Error Resolutions & Root Cause Analysis

### A. Resolution for `ERROR: 42P01: relation "public.users" does not exist`
- **Root Cause:** PostgreSQL `DROP TRIGGER IF EXISTS trg_name ON table_name` throws `42P01` if the table itself is not present (the `IF EXISTS` applies to the trigger, not the table). Furthermore, out-of-order execution before `03_tables.sql` triggered fatal aborts.
- **Fix:** All trigger bindings in `06_triggers_and_functions.sql` and RLS policies in `05_rls_policies.sql` are now guarded with `IF to_regclass(...) IS NOT NULL`.

### B. Resolution for `ERROR: 42P01: relation "public.system_settings" does not exist`
- **Root Cause:** Executing `08_seed_synthetic_data.sql` prematurely before table 40 (`system_settings`) was created.
- **Fix:** Added a pre-flight validation block in `08_seed_synthetic_data.sql` that verifies prerequisite tables before attempting row insertions.

### C. Resolution for `09_verify.sql` Aborts
- **Root Cause:** Static `UNION ALL SELECT count(*) FROM table` crashed if any single table was missing or during empty schema runs.
- **Fix:** Refactored Section 6 to use dynamic catalog queries (`query_to_xml` with `to_regclass`), safely evaluating table existence and row counts without throwing exceptions.
