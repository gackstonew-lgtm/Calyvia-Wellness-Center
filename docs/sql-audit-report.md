# Calyvia Wellness Center — Comprehensive Supabase SQL Audit & Resolution Report

**Facility:** Calyvia Wellness Center, Mugutha, Ruiru, Kiambu County, Kenya  
**System:** Hospital Management Information System & Electronic Medical Records (HMIS/EMR)  
**Target Engine:** PostgreSQL 16 (Hosted Supabase Cloud / Self-Hosted Supabase)  
**Audit Scope:** Complete repository SQL inventory (`supabase/sql/*`), TypeScript database service mappings (`apps/api/src/database/*`), and authentication/authorization workflows.  
**Compliance Standard:** Kenya Data Protection Act, 2019 (Sections 44–47)  

---

## 1. Executive Summary

A comprehensive forensic audit of all database migration scripts, table schemas, triggers, indexes, Row Level Security policies, and verification queries was conducted for the Calyvia Wellness Center HMIS/EMR platform. 

The primary objectives were:
1. Systematically eliminate recurring PostgreSQL execution errors (`42P01: relation does not exist`).
2. Guarantee 100% architectural alignment between PostgreSQL DDL and the NestJS application data access layer (`MODEL_TABLE_MAP` in `SupabaseService`).
3. Ensure strict topological dependency ordering across all 40 relational domain tables.
4. Integrate the employee account approval workflow directly into core table DDL.
5. Strictly isolate baseline clean-state production deployment from optional synthetic test datasets.

All identified vulnerabilities, syntax fragilities, and ordering defects have been resolved. Every migration script is now strictly idempotent and hardened against missing catalog objects.

---

## 2. Root Cause Analysis of Specific Error Triggers

### 2.1 Issue A: `ERROR: 42P01: relation "public.users" does not exist`

#### Symptom:
When executing trigger installations or partial migration runs, PostgreSQL terminated with:
```
ERROR: 42P01: relation "public.users" does not exist
```

#### Root Cause:
1. **PostgreSQL Trigger DDL Quirk:** In PostgreSQL, the syntax `DROP TRIGGER IF EXISTS trg_name ON table_name;` only checks if the *trigger* exists; if the *table* does not exist, PostgreSQL immediately raises a fatal `42P01 (undefined_table)` exception.
2. In `06_triggers_and_functions.sql`, the timestamp trigger loop iterated over an array containing `'users'`, `'patients'`, etc., and executed `DROP TRIGGER IF EXISTS ... ON public.%I` without first verifying whether the target table was present in the database catalog.
3. If `06_triggers_and_functions.sql` was executed prematurely, or if a prior script (`02_types_and_enums.sql` or `03_tables.sql`) halted on an unhandled error, `public.users` was absent, aborting the entire trigger script.

#### Engineering Resolution:
- Rewrote the trigger attachment loops in `06_triggers_and_functions.sql` to guard every table reference with `IF to_regclass(format('public.%I', tbl)) IS NOT NULL THEN`.
- If a table does not exist at execution time, a descriptive `NOTICE` is emitted instead of an aborting fatal error.
- Guarded `trg_sync_bed_occupancy`, `trg_audit_clinical_notes`, and `trg_audit_admissions` with strict `to_regclass` catalog lookups.

---

### 2.2 Issue B: `ERROR: 42P01: relation "public.system_settings" does not exist`

#### Symptom:
When executing `08_seed_synthetic_data.sql`, the script failed immediately on statement 1:
```
ERROR: 42P01: relation "public.system_settings" does not exist
```

#### Root Cause:
1. `public.system_settings` is defined as table #40 (the final domain table) in `03_tables.sql`.
2. When users or automated deployment pipelines ran `08_seed_synthetic_data.sql` before `03_tables.sql` completed, or when `03_tables.sql` terminated earlier in the file (e.g. due to missing enum types), `system_settings` was never created.
3. `08_seed_synthetic_data.sql` lacked pre-flight prerequisite guards, attempting unconditional DML `INSERT INTO public.system_settings` against an unready schema.

#### Engineering Resolution:
- Embedded a pre-flight validation block in `08_seed_synthetic_data.sql` that tests `to_regclass('public.users')` and `to_regclass('public.system_settings')` before running any INSERT statement. If tables are missing, the script halts with a clear, actionable diagnostic message rather than a generic SQL error.
- Verified that `public.system_settings` in `03_tables.sql` has `setting_key TEXT UNIQUE NOT NULL` and is included in the updated_at trigger and RLS policies.

---

### 2.3 Issue C: `09_verify.sql` Verification Script Failures

#### Symptom:
`09_verify.sql` aborted on Section 6 with `relation does not exist` or returned errors when inspecting a clean production database.

#### Root Cause:
1. Section 6 of `09_verify.sql` originally utilized static SQL `SELECT count(*) FROM public.users UNION ALL SELECT count(*) FROM public.staff_profiles ...`.
2. If even one table failed to create during migration, the static query failed completely, preventing the developer from seeing which tables *did* succeed.
3. The query also conflated clean production state (zero rows) with error states.

#### Engineering Resolution:
- Completely refactored Section 6 of `09_verify.sql` to use dynamic SQL reflection via `query_to_xml` and `to_regclass`.
- The query evaluates all 40 domain tables dynamically:
  * If a table exists, it retrieves the live count and tags the state as either `'OK (Clean / Empty for Production)'` (0 rows) or `'OK (Contains Persisted Records)'` (>0 rows).
  * If a table is absent, it reports `'MISSING'` with `'FAIL: Table not found'` without aborting the query.
- This provides an immediate, full-spectrum diagnostic matrix across all 40 domain tables in a single SQL execution.

---

## 3. Inventory and Architectural Reconciliation

### 3.1 Domain Table Mapping
The database architecture defines exactly **40 relational domain tables**, precisely mirroring `MODEL_TABLE_MAP` in `apps/api/src/database/supabase.service.ts`:

1. `users` (Core Identity & Authentication)
2. `staff_profiles` (Professional & Licensing Metadata)
3. `staff_schedules` (Shift Allocations & Attendance)
4. `staff_credentials` (Board Certifications & Accreditations)
5. `audit_logs` (KDPA Compliant Immutable Audit Trail)
6. `patients` (Master Patient Index & Demographics)
7. `emergency_contacts` (Next of Kin & Financial Guarantors)
8. `patient_consents` (Informed Consent Agreements)
9. `referral_partners` (Healthcare Partners & NGOs)
10. `leads` (CRM Intake & Public Inquiries)
11. `admissions` (Clinical Admission Episodes)
12. `rooms` (Ward Facility Management)
13. `beds` (Physical Bed Inventory)
14. `bed_allocations` (Bed Assignment & Real-Time Census)
15. `clinical_notes` (Psychiatric, Medical & Nursing Progress Notes)
16. `detox_episodes` (Substance Detoxification Protocols)
17. `withdrawal_assessments` (CIWA-Ar & COWS Scoring Logs)
18. `vitals_logs` (Continuous Vital Signs Monitoring)
19. `counselling_sessions` (Individual, Group & Family Therapy)
20. `appointments` (Clinical & Psychiatric Consultations)
21. `medications` (Formulary & Controlled Substances Catalog)
22. `pharmacy_stock_batches` (Lot Numbers, Batch Expiries & Stock)
23. `prescriptions` (Doctor's Medication Orders)
24. `prescription_items` (Itemized Prescriptions & Dosages)
25. `medication_administrations` (Electronic Medication Administration Record - e-MAR)
26. `invoices` (Patient Billing & Fee Schedules)
27. `invoice_items` (Itemized Inpatient & Clinical Charges)
28. `payments` (Collections, Copays & Receipts)
29. `mpesa_transactions` (Safaricom Daraja API C2B/STK Traces)
30. `movement_records` (Patient Leaves, Court Appearances & Escorts)
31. `visitor_logs` (Gate Screening, Contraband Check & Logs)
32. `incident_reports` (Clinical & Facility Safety Incidents)
33. `staff_tasks` (Inter-Departmental Operational Tasks)
34. `inventory_items` (Store & Facility Consumables)
35. `discharge_records` (Medical & Financial Discharge Summaries)
36. `aftercare_plans` (Relapse Prevention & Continuing Care Plans)
37. `aftercare_checkins` (Sobriety Milestones & Follow-up Calls)
38. `communication_logs` (SMS / Email Automated Dispatch History)
39. `feedback_surveys` (Patient Experience & NPS Audits)
40. `system_settings` (Facility Configurations & Operational Parameters)

### 3.2 Direct Integration of Employee Approval Workflow
The employee account approval workflow (previously in standalone script `10_employee_approval_workflow.sql`) has been unified directly into:
1. `03_tables.sql` — Columns `approval_status`, `approved_by`, `approved_at`, `rejection_reason`, and `requested_role` are now core columns on table creation.
2. `04_indexes.sql` — Added index `idx_users_approval_status` for fast administrative query filtering.
3. `08_seed_synthetic_data.sql` — Default seeded users explicitly carry `approval_status = 'APPROVED'`.
4. `10_employee_approval_workflow.sql` — Maintained as an idempotent, non-destructive migration script for pre-existing production databases.

---

## 4. Production Clean-State vs Synthetic Test Seed Separation

In compliance with enterprise healthcare standards:
- **Production Initialization:** Paste only [`00_master_init_calyvia_database.sql`](file:///c:/xampp/htdocs/Calyvia/supabase/sql/00_master_init_calyvia_database.sql) (or execute 01 through 07, followed by 09). All domain tables will be initialized with **zero business rows**.
- **Admin Account Provisioning:** Executed via the CLI utility:
  ```bash
  npm run provision:admin -- --email="admin@calyviawellness.co.ke" --name="Antony Kariuki"
  ```
- **Synthetic Test Seed:** [`08_seed_synthetic_data.sql`](file:///c:/xampp/htdocs/Calyvia/supabase/sql/08_seed_synthetic_data.sql) is reserved strictly for non-production development, local testing, and UAT environments. It contains strictly synthetic test personas complying with the Kenya Data Protection Act 2019.

---

## 5. Summary of Files Audited & Updated

| File | Status | Description of Changes |
|:--|:--|:--|
| `00_master_init_calyvia_database.sql` | **Refactored & Regenerated** | Consolidates all repaired DDL scripts (01-07) and dynamic verification (09). |
| `01_extensions.sql` | **Hardened** | Added database-level `ALTER DATABASE ... SET search_path` safety block. |
| `02_types_and_enums.sql` | **Audited & Verified** | All 16 custom ENUMs validated and guarded with `duplicate_object` handlers. |
| `03_tables.sql` | **Updated** | Added approval columns to `users`; confirmed DAG dependency ordering across all 40 tables. |
| `04_indexes.sql` | **Updated** | Added `idx_users_approval_status` index for administrative filtering. |
| `05_rls_policies.sql` | **Hardened** | All table RLS activations and policy assignments guarded with `to_regclass`. |
| `06_triggers_and_functions.sql` | **Hardened** | Guarded all trigger attachments with `to_regclass`, eliminating `42P01` errors. |
| `07_storage_buckets.sql` | **Hardened** | Guarded storage bucket inserts and policies against non-Supabase storage schemas. |
| `08_seed_synthetic_data.sql` | **Hardened** | Added pre-flight table existence check; included `approval_status = 'APPROVED'`. |
| `09_verify.sql` | **Refactored** | Implemented dynamic SQL reflection across all 40 tables; zero fatal error risk. |
| `10_employee_approval_workflow.sql` | **Hardened** | Guarded with table existence checks and descriptive notices. |
| `99_reset_dev_only.sql` | **Audited & Verified** | Verified reverse DAG table dropping and production database guard. |
| `00_README.md` | **Updated** | Rewritten with comprehensive operational instructions and troubleshooting notes. |
