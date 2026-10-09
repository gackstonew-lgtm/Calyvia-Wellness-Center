# Kenya Data Protection Act (KDPA 2019) Compliance Guide

## 1. Statutory Context & Principles

The **Kenya Data Protection Act, 2019 (Act No. 24 of 2019)** regulates the processing of personal data in Kenya. Under **Part VII (Sections 44 to 47)**, health and medical data — particularly substance-use disorder histories, psychiatric evaluations, and addiction treatment records — are categorized as **Sensitive Personal Data**.

Section 46 specifically mandates that:
> *"Personal data relating to health shall not be processed unless the processing is necessary for reasons of public interest in the area of public health or by a health care provider subject to the obligation of professional secrecy."*

The Calyvia Wellness Center Management System was architected from inception to satisfy statutory obligations overseen by the **Office of the Data Protection Commissioner (ODPC)** in Kenya.

---

## 2. Technical Safeguards Implemented

### A. Field-Level Encryption (AES-256-GCM)
Standard database disk encryption does not prevent a privileged database administrator or compromised backup dump from viewing plain text addiction notes. To achieve defense-in-depth:
- Plaintext clinical fields (`knownAllergies`, `substanceHistory`, `subjective`, `objective`, `assessment`, `plan`, `nationalIdNumber`) are intercepted prior to database persistence.
- The `CryptoService` generates a cryptographically random 12-byte Initialization Vector (IV) per record.
- Data is encrypted using AES-256-GCM, generating an authenticated tag (16 bytes).
- Stored payload format: `[Base64 IV] : [Base64 AuthTag] : [Base64 Ciphertext]`.
- Tampering with ciphertext or authentication tag results in decryption rejection (`[ENCRYPTED_DATA_ACCESS_DENIED]`).

### B. Immutable Audit Trail
Section 41 of the Act requires data controllers to implement technical measures ensuring accountability and traceability:
- Every HTTP request mutating or viewing patient health charts triggers the `AuditLogInterceptor`.
- Captures:
  1. `userId` and `role`
  2. `action` (e.g. `VIEW_PATIENT_CHART`, `RECORD_WITHDRAWAL_ASSESSMENT`)
  3. `resource` and `resourceId`
  4. Real client IP address (accounting for reverse proxies)
  5. User-Agent and UTC timestamp
- The `audit_logs` table has no application-level update or delete operations exposed.

### C. Explicit Patient & Guardian Consents
- Module 15 (`DocumentsModule`) maintains an immutable digital consent ledger capturing:
  1. Consent to Inpatient Admission and Treatment
  2. Consent to Emergency Medical Detoxification Protocols
  3. Explicit Data Processing Consent under KDPA 2019
  4. Authorization for designated Next-of-Kin / Financial Guarantor updates
- Each consent record records the signatory's legal name, phone, timestamp, and digital signature token.

---

## 3. Data Subject Rights Workflows

Under Part IV (Section 26) of the Act, patients and authorized representatives hold fundamental rights:

1. **Right to be Informed:** Presented upon first intake at front desk or web enquiry form.
2. **Right of Access:** Exportable patient chart summaries available via `PatientsService.findOne()`.
3. **Right to Rectification:** Demographic details (address, phone) can be amended via `PATCH /api/v1/patients/:id` with auditable diffs.
4. **Right to Erasure / Anonymization:** For discharged patients requesting data archiving, `isArchived = true` marks records for historical retention compliant with Kenya Medical Records Retention regulations (minimum 10 years) while disabling active staff search.
