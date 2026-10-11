# Calyvia Wellness Center — Supabase Production Database Deployment Guide

**Target System:** Calyvia Wellness Center HMIS/EMR  
**Production Host:** Hosted Supabase Cloud / Managed PostgreSQL 16  
**Facility Location:** Mugutha, Behind Full Gospel Church, Ruiru, Kiambu County, Kenya  
**Author:** DevOps & Senior Database Architecture Team  
**Compliance Standard:** Kenya Data Protection Act, 2019  

---

## 1. Prerequisites & Environment Setup

Before executing database setup, verify the following connection variables in your root and backend environment configurations (`.env` and `apps/api/.env`):

```ini
# Supabase Configuration
SUPABASE_URL="https://<your-project-id>.supabase.co"
SUPABASE_ANON_KEY="<your-anon-key>"
SUPABASE_SERVICE_ROLE_KEY="<your-service-role-key>"

# Direct PostgreSQL Connection (Transaction Pooler or Direct Connection)
DATABASE_URL="postgresql://postgres.<project-id>:<password>@aws-0-<region>.pooler.supabase.com:6543/postgres?sslmode=require"
DIRECT_URL="postgresql://postgres:<password>@db.<project-id>.supabase.co:5432/postgres?sslmode=require"

# Calyvia Cryptographic Key (32-byte AES-256 encryption key)
ENCRYPTION_MASTER_KEY="<your-secure-32-byte-hex-key>"
```

---

## 2. Production Deployment Execution

In a production rollout, the application database MUST start empty. Persisted business records will be entered by authenticated hospital staff through the Calyvia UI.

### Option A: Single Master Script (Fastest & Recommended)

1. Log in to the [Supabase Dashboard](https://supabase.com/dashboard).
2. Select your Calyvia project and navigate to **SQL Editor** in the left navigation sidebar.
3. Click **+ New Query**.
4. Open [`supabase/sql/00_master_init_calyvia_database.sql`](file:///c:/xampp/htdocs/Calyvia/supabase/sql/00_master_init_calyvia_database.sql), copy its entire contents, and paste into the editor.
5. Click **Run** (or press `Ctrl+Enter` / `Cmd+Enter`).
6. Inspect the execution results in the output pane:
   - **Extensions:** Confirms `uuid-ossp`, `pgcrypto`, and `citext` are installed.
   - **Table Count:** Confirms `PASS (40/40 Domain Tables Verified)`.
   - **RLS Status:** Confirms `RLS_ENABLED (PASS)` on 100% of tables.
   - **Table Inventory:** All 40 tables output `PRESENT` and evaluate to `OK (Clean / Empty for Production)`.

---

### Option B: Modular Execution (Step-by-Step)

If your database policy requires individual modular reviews, execute the scripts sequentially:

```
Step 1: 01_extensions.sql
Step 2: 02_types_and_enums.sql
Step 3: 03_tables.sql
Step 4: 04_indexes.sql
Step 5: 05_rls_policies.sql
Step 6: 06_triggers_and_functions.sql
Step 7: 07_storage_buckets.sql
Step 8: 09_verify.sql
```

> [!IMPORTANT]
> **DO NOT** execute `08_seed_synthetic_data.sql` on a production database. Script 08 contains synthetic demonstration patients and mock billing data intended strictly for development, QA, and UAT environments.

---

## 3. Provisioning the Initial Superior Administrator

Once the database schema is verified, provision the primary authoritative system administrator account:

```bash
# Navigate to repository root
cd c:\xampp\htdocs\Calyvia

# Execute administrator provisioning utility
npm run provision:admin -- \
  --email="admin@calyviawellness.co.ke" \
  --name="Antony Kariuki" \
  --phone="+254700534306" \
  --password="<SecureProductionPassword123!>" \
  --require-password-change=false
```

This utility automatically:
1. Hashes the password using Argon2id (`v=19`, `m=65536`, `t=3`, `p=4`).
2. Creates or reconciles the user in `public.users` with `role = 'SUPER_ADMIN'` and `approval_status = 'APPROVED'`.
3. Creates the associated administrative profile in `public.staff_profiles`.
4. Emits a tamper-evident audit record in `public.audit_logs`.

---

## 4. Verification & Health Sanity Checklist

Execute [`supabase/sql/09_verify.sql`](file:///c:/xampp/htdocs/Calyvia/supabase/sql/09_verify.sql) at any time to verify system health.

Expected output metrics:

| Section | Target Metric | Expected Status |
|:--|:--|:--|
| **1. Extensions** | `uuid-ossp`, `pgcrypto`, `citext` | `INSTALLED (PASS)` |
| **2. Table Count** | Total Base Tables = 40 | `PASS (40/40 Domain Tables Verified)` |
| **3. Row Level Security** | Unprotected tables count = 0 | `RLS_ENABLED (PASS)` on all tables |
| **4. Triggers** | `trg_<tbl>_updated_at`, `sync_bed`, `audit` | `ACTIVE` |
| **5. Storage Buckets** | 4 buckets (`patient-documents`, etc.) | `CONFIGURED` |
| **6. Table Records** | Clean production baseline | All 40 tables: `PRESENT`, record count = 0 (or 1 admin in users) |

---

## 5. Non-Production Seeding (Development & Staging Only)

To test features, clinical workflows, and reporting in local or staging environments with realistic Kenyan healthcare data:

1. Execute steps 01 through 07.
2. Open [`supabase/sql/08_seed_synthetic_data.sql`](file:///c:/xampp/htdocs/Calyvia/supabase/sql/08_seed_synthetic_data.sql) in SQL Editor and click **Run**.
3. Re-run `09_verify.sql` — record counts will now display realistic counts across staff, wards, synthetic patients, and M-Pesa transactions.

---

## 6. Backup, Disaster Recovery & Reset

### Automated Daily Backups
Supabase handles automated physical database backups. For programmatic point-in-time logical backups:
```bash
# Export full public schema and data
pg_dump "$DATABASE_URL" --format=custom --no-owner --no-privileges --file="calyvia_backup_$(date +%Y%m%d).dump"
```

### Development Teardown & Reset
To completely purge and re-initialize a non-production database:
```sql
-- Execute only in dev / local / test databases:
\i supabase/sql/99_reset_dev_only.sql
```
> [!WARNING]
> `99_reset_dev_only.sql` contains a hard safety guard that will automatically abort execution if the connected database name matches production patterns (`production`, `*prod*`). Never bypass this check on live environments.
