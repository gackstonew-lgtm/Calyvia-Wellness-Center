# ADR-001: Target Architecture for Calyvia Supabase Conversion

**Document ID:** ADR-SUPABASE-001  
**Status:** PROPOSED (Requires Project Owner / Tech Lead Approval)  
**Author:** Developer 2 (Full-stack workflows / UI), Quantum Code Technologies  
**Reviewers:** Dev 1 (Technical Lead / Backend), Dev 3 (QA / Integrations / DevOps)  
**Date:** 2026-10-09  

---

## 1. Context & Problem Statement

Calyvia Wellness Center requires a secure, production-grade management portal (`portal.calyviawellness.co.ke`) and clinical system (HMIS/EMR) to digitise the recovery journey (Enquiry → Detox → Rehabilitation → Aftercare) and operational workflows. 

The project has an additional mandate to **convert and prepare the platform to run on Supabase as its primary backend hosting platform**. We have a 4-week timebox. We must evaluate whether to adopt a **Supabase-Native** architecture or a **Hybrid** architecture.

---

## 2. Options Considered

### Option 1: Supabase-Native Architecture
- **Database & Data Access:** PostgreSQL 16 managed via Supabase CLI migrations (`/supabase/migrations/`). CRUD operations executed via PostgREST and `@supabase/ssr` directly from Next.js (App Router Server Components and Client Components).
- **Security & Authorization:** Row Level Security (RLS) enabled on **100% of tables**. A secure database helper function (`auth.staff_role()`) evaluates role claims. Default deny policy.
- **Authentication:** Supabase Auth (email/password with secure password reset; TOTP MFA for privileged clinical roles). Sessions managed via HTTP-only cookies on `portal.calyviawellness.co.ke`.
- **Custom Business Logic & Webhooks:** Supabase Edge Functions (Deno/TypeScript) for external integration webhooks (Safaricom Daraja M-Pesa STK push and idempotent callbacks; public website enquiry form).
- **Scheduled Automation:** `pg_cron` database schedules triggering stored procedures or webhook dispatches for detox vitals alarms, e-MAR dosing alerts, and aftercare follow-up cadences.
- **File Storage:** Supabase Storage with private buckets (`patient-documents`, `clinical-consents`) protected by storage RLS policies and short-lived signed URLs. Dedicated public bucket for published CMS media.
- **Realtime:** Supabase Realtime channels for non-sensitive aggregates (real-time bed census updates, on-duty nurse vitals alerts).

### Option 2: Hybrid Architecture
- Keep the current NestJS application as a separately hosted Node.js container service (e.g. on AWS ECS, Render, or Railway).
- Replace the local PostgreSQL container with Supabase PostgreSQL.
- Replace custom JWT signing with Supabase Auth verification in NestJS Passport strategy.
- Retain NestJS controllers for all API endpoints, using Supabase Storage and Realtime via SDK.

---

## 3. Comparison Matrix

| Evaluation Criteria | Option 1: Supabase-Native (Recommended) | Option 2: Hybrid |
|---|---|---|
| **Hosting & Operational Burden** | **Very Low.** Single platform (Supabase + Next.js Vercel/Node hosting). No separate backend container to monitor, patch, or scale. | **High.** Requires hosting and maintaining both the NestJS API container and the Supabase project. |
| **Security Posture (Least Privilege)** | **Superior.** RLS enforces permissions at the database engine level. Even if frontend code is compromised, raw SQL/PostgREST queries cannot bypass RLS. | **Moderate.** Relies primarily on application-layer NestJS guards. Single database connection string bypasses database-level isolation. |
| **Data Integrity & Concurrency** | **High.** Transactional Postgres functions (RPC) with exclusion constraints eliminate double-booking of beds and duplicate M-Pesa payments. | **High.** Handled via NestJS Prisma transactions. |
| **Latency & Performance** | **Optimal.** Next.js Server Components query Postgres directly via connection pooler (Supavisor) without an intermediate HTTP API hop. | **Sub-optimal.** Frontend → NestJS API → Supabase PostgreSQL (two network hops). |
| **4-Week Timebox Feasibility** | **Feasible.** Schema is already designed and tested; converting Prisma to Supabase SQL DDL is mechanical; Next.js App Router natively pairs with `@supabase/ssr`. | **Feasible.** Less migration code in Week 1, but higher DevOps, staging, and deployment burden in Weeks 3–4. |
| **Cost for Calyvia Facility** | **Low.** Supabase Pro tier covers Postgres, Auth, Storage, Edge Functions, and Backups under a single predictable subscription. | **Higher.** Requires separate server instance for NestJS API plus Supabase subscription. |

---

## 4. Recommendation & Decision

**Recommendation:** Proceed with **Option 1: Supabase-Native**.

### Rationale:
1. **Clinical Safety & Legal Compliance:** Substance-use disorder data governed by the Kenya Data Protection Act (KDPA 2019) requires zero-trust access control. Supabase RLS enforces data boundaries at the engine level, ensuring a nurse or receptionist can never access unauthorized clinical narratives, even through API manipulation.
2. **Simplified Operational Footprint:** Calyvia Wellness Center is a healthcare facility, not a tech company. Eliminating the maintenance of an independent NestJS API server simplifies long-term operations and removes single points of failure.
3. **Synergy with Next.js 14+ App Router:** Using `@supabase/ssr` within Next.js Server Components and Server Actions provides a clean, modern, type-safe architecture without redundant API boilerplate.
4. **Idempotent Edge Functions for M-Pesa:** Safaricom Daraja STK Push and callback processing map cleanly to Supabase Edge Functions with cryptographically verified payloads and atomic database transactions.

---

## 5. Architectural Safeguards for Option 1

1. **No Client-Side Secrets:** `SUPABASE_SERVICE_ROLE_KEY` is strictly prohibited in frontend bundles. Only `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are exposed to the browser.
2. **Private Storage by Default:** Patient documents, lab results, and signed consent forms are placed in private buckets accessible only via time-limited signed URLs generated server-side.
3. **Database-Level Idempotency:** The `mpesa_transactions` table enforces unique constraints on `checkout_request_id` and `mpesa_receipt_number`. Duplicate callbacks will trigger an idempotent acknowledge response without altering balances twice.
4. **Dev 1 & Dev 3 Sign-Off Gate:** All SQL migrations, RLS policies, and Auth hooks must be peer-reviewed and approved by Dev 1 (Technical Lead). All environment, CI, and backup configurations must be approved by Dev 3 (DevOps/QA).

---

## 6. Next Steps Upon Approval

1. Initialize `/supabase/` configuration with `config.toml`.
2. Convert Prisma schema to versioned SQL migrations in `/supabase/migrations/` with RLS policies for P0/P1 tables.
3. Write pgTAP test suites proving RLS isolation per role.
4. Integrate `@supabase/ssr` client into `apps/admin` portal.
