# ADR-001: Target Architecture for Calyvia Supabase Migration

**Document ID:** ADR-SUPABASE-001  
**Status:** PROPOSED & RECOMMENDED (Option A: Hybrid)  
**Author:** Principal Full-Stack Software Engineer (Developer 2), Quantum Code Technologies  
**Reviewers:** Developer 1 (Technical Lead / Backend), Developer 3 (QA / Integrations / DevOps)  
**Date:** 2026-10-09  
**Target Environment:** Calyvia Wellness Center (`portal.calyviawellness.co.ke`)  

---

## 1. Context & Business Drivers

Calyvia Wellness Center requires a secure, resilient Hospital Information Management System (HMIS) and Electronic Medical Records (EMR) system to manage inpatient and outpatient psychiatric rehabilitation in Ruiru, Kenya. 

The system encompasses **28 clinical, administrative, and financial modules**, handling highly sensitive health records (substance use history, psychiatric diagnoses, withdrawal vital signs, controlled medication dispensing) governed under the **Kenya Data Protection Act, 2019 (Sections 44–47)**.

The project mandate requires preparing and transitioning the backend infrastructure to run on **Supabase** as its backend hosting platform (PostgreSQL, Auth, Storage, Edge Functions, Realtime, scheduled automation).

With a **4-week delivery timebox** and an absolute requirement to prioritize **clinical safety, data integrity, and compliance over speed**, we evaluated two core architectural strategies:
1. **Option A: Hybrid Architecture** (NestJS application server on App Runner / VPS / container + Supabase Managed PostgreSQL, Supabase Auth verification, Supabase Storage, Supabase Realtime).
2. **Option B: Supabase-Native Architecture** (Complete rewrite of the API layer into Next.js Server Actions / PostgREST direct client queries + Supabase Edge Functions + 100% database RLS).

---

## 2. Options Evaluated

### Option A: Hybrid Architecture (Recommended)

In this architecture, the backend service boundaries are cleanly separated between application domain orchestration and managed cloud infrastructure:
- **Database:** Supabase Managed PostgreSQL 16 with Supavisor connection pooling (port 6543 for application queries; port 5432 direct for schema migrations).
- **Domain API & Clinical Rules:** Existing NestJS 10.3.8 modular monolith (all 28 modules) hosted on AWS App Runner, Render, Railway, or a hardened VPS container.
- **Data Access:** Prisma ORM connected via Supabase connection pooler with SSL mode enabled.
- **Authentication & Tokens:** Supabase Auth issues JWT tokens; NestJS `JwtStrategy` validates tokens against the Supabase JWT secret / JWKS endpoint.
- **Security & Encryption:** Application-layer AES-256-GCM field-level encryption for sensitive psychiatric and demographic data executed in Node.js before database persistence.
- **File & Document Storage:** Supabase Storage (private S3-compatible buckets for `patient-documents`, `medical-records`, `prescriptions`) accessed via Supabase JavaScript SDK using short-lived signed URLs.
- **Row Level Security:** Database RLS enabled across all tables with a bypass policy for the authenticated `service_role` utilized by the NestJS backend, plus staff role policies for read-only audits.
- **External Webhooks & Callbacks:** Safaricom Daraja M-Pesa callbacks and public website enquiries ingested by NestJS integration controllers with atomic Prisma database transactions.

---

### Option B: Supabase-Native Architecture

In this architecture, the NestJS application server is dismantled:
- **Client Queries:** Next.js 14 App Router queries Supabase PostgreSQL directly via PostgREST and `@supabase/ssr`.
- **Authorization:** 100% of authorization is offloaded to PostgreSQL Row Level Security (RLS) policies evaluated on every single SQL query.
- **Business Logic:** Complex multi-step operations (e.g., CIWA scoring calculation, discharge clearing, M-Pesa payment posting) are rewritten into PostgreSQL Stored Procedures (PL/pgSQL RPCs) or Supabase Edge Functions (Deno).
- **Background Jobs:** BullMQ queues are replaced by `pg_cron` jobs invoking database functions.
- **Webhooks:** M-Pesa callbacks and public website lead ingestion are handled via Supabase Edge Functions.

---

## 3. Comparative Evaluation Matrix

| Evaluation Dimension | Option A: Hybrid (Recommended) | Option B: Supabase-Native |
|:---|:---|:---|
| **Clinical Safety & Transaction Integrity** | **Superior.** Complex multi-table transactions (e.g., bed allocation transfer, medication administration, financial clearance) run within strict Prisma `$transaction` blocks with compile-time TypeScript type checking. | **High Risk.** Requires rewriting clinical workflows into PL/pgSQL functions or multi-round-trip client operations, increasing concurrency risks. |
| **KDPA 2019 Field-Level Encryption** | **Proven & Isolated.** Master encryption keys remain strictly inside the backend Node.js memory space. Ciphertext is stored in Postgres. No keys ever touch the frontend. | **Complex.** Encryption must either be performed via browser WebCrypto (exposing keys or complexity), or via `pgcrypto` inside database procedures. |
| **Monorepo Code Preservation** | **100% Preserved.** All 28 scaffolded and audited NestJS modules, controllers, DTOs, pipes, filters, and unit tests continue functioning without regressions. | **Destructive.** Over 15,000 lines of audited NestJS domain code, unit tests, and validation pipes would need to be rewritten or scrapped. |
| **M-Pesa Daraja Callback Safety** | **Deterministic & Hardened.** Existing idempotent NestJS webhook handlers process Safaricom IPN callbacks with verified signatures and automated ledger reconciliation. | **Moderate.** Requires authoring and testing Deno Edge Functions, managing secret environments, and handling cold starts. |
| **4-Week Delivery Timeline** | **Predictable & Low-Risk.** Transitioning the database connection string and storage driver to Supabase requires days, not weeks. Focus remains on UI workflows and clinical features. | **High Schedule Risk.** Complete rewrite of API layer to PostgREST and PL/pgSQL would consume the entire timebox, leaving minimal time for UAT and testing. |
| **Operational & Hosting Overhead** | **Low.** Supabase manages PostgreSQL, automated daily backups, point-in-time recovery (PITR), and storage. NestJS runs as a single stateless container. | **Very Low.** Serverless execution only; however, maintenance of complex PL/pgSQL procedures transfers to database administrators. |
| **Future Extensibility** | **High.** Provides an immediate, production-ready foundation, with the freedom to selectively offload individual features (e.g. Realtime bed census, storage uploads) to Supabase natively over time. | **High lock-in.** Heavily coupled to PostgREST conventions and PL/pgSQL logic. |

---

## 4. Decision & Architectural Recommendation

### Recommendation: Proceed with **Option A: Hybrid Architecture**

### Key Rationale:
1. **Never Trade Clinical Safety for Novelty:** In a psychiatric rehabilitation clinic, bugs in medication administration (e-MAR), detox withdrawal monitoring (CIWA/COWS), or bed double-allocation can result in severe medical harm. The existing NestJS domain logic is type-safe, validated, and verified.
2. **Regulatory Compliance (KDPA 2019):** Sensitive health information cannot be exposed to client-side vulnerabilities. Keeping field-level encryption (AES-256-GCM) in the backend server guarantees that encryption keys never enter the client runtime.
3. **Audit Trail Immutability:** The backend `AuditLogInterceptor` records every read and mutation before data reaches the client. This centralized interceptor is significantly more auditable than scattered PostgREST queries.
4. **Pragmatic Timebox Management:** Developer 2's accountability is to deliver robust UI workflows and end-to-end user journeys (intake $\rightarrow$ admission $\rightarrow$ clinical $\rightarrow$ billing $\rightarrow$ discharge $\rightarrow$ aftercare). Option A delivers a rock-solid, hosted Supabase backend immediately without wasting valuable engineering hours rewriting working code.

---

## 5. Migration Roadmap & Supabase Resource Mapping

Under Option A, the migration steps are executed as follows:

```
+--------------------------------------------------------------------------------+
|                             Calyvia Cloud Architecture                         |
+--------------------------------------------------------------------------------+
|                                                                                |
|   [ Authorized Staff ]                                  [ Public Website ]     |
|   portal.calyviawellness.co.ke                          calyviawellness.co.ke  |
|            │                                                     │             |
|            ▼                                                     ▼             |
|   +──────────────────────────+                        +─────────────────────+  |
|   |  Next.js 14 Admin Portal |                        | Website Lead Form   |  |
|   |  (Vercel / Cloudflare)   |                        +─────────────────────+  |
|   +─────────────┬────────────+                                   │             |
|                 │                                                │             |
|                 ▼                                                ▼             |
|   +─────────────────────────────────────────────────────────────────────────+  |
|   |             NestJS API Monolith (App Runner / VPS Container)            |  |
|   |   - 28 Audited Domain Modules        - AES-256-GCM CryptoService        |  |
|   |   - Global Audit Interceptor         - Passport JWT / Supabase Auth     |  |
|   |   - Safaricom Daraja Webhook         - RFC 7807 Error Responses         |  |
|   +─────────────────────────────────────┬───────────────────────────────────+  |
|                                         │                                      |
|                                         ▼ SSL / TLS                            |
|   +─────────────────────────────────────────────────────────────────────────+  |
|   |                     Hosted Supabase Platform (AWS eu-west-1)            |  |
|   |                                                                         |  |
|   |   [ Supavisor Connection Pooler (Port 6543) ]                           |  |
|   |        │                                                                |  |
|   |        ▼                                                                |  |
|   |   [ PostgreSQL 16 Enterprise Database ]                                 |  |
|   |        - 41 Relational Tables (01-04 DDL)                               |  |
|   |        - Row Level Security on 100% of tables (05_rls_policies.sql)     |  |
|   |        - Automated `updated_at` & Audit Triggers (06_triggers.sql)      |  |
|   |        - Automated Nightly Backups & Point-In-Time Recovery             |  |
|   |                                                                         |  |
|   |   [ Supabase Storage ] (07_storage_buckets.sql)                         |  |
|   |        - Buckets: patient-documents, medical-records, prescriptions     |  |
|   |                                                                         |  |
|   |   [ Supabase Realtime ]                                                 |  |
|   |        - Real-time Bed Census updates & Critical Vitals Alarms          |  |
|   +─────────────────────────────────────────────────────────────────────────+  |
|                                                                                |
+--------------------------------------------------------------------------------+
```

---

## 6. Review & Sign-Off

- **Dev 2 (Author):** Submitted for Lead Review.
- **Dev 1 (Technical Lead / Backend):** Review pending.
- **Dev 3 (QA / DevOps):** Review pending.
