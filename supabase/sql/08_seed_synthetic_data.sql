-- ==============================================================================
-- 08_seed_synthetic_data.sql
-- Calyvia Wellness Center Management System (HMIS/EMR)
-- Realistic Synthetic Seed Data for Calyvia Wellness Center (Ruiru, Kenya)
-- ==============================================================================
-- 
-- LEGAL COMPLIANCE NOTICE (Kenya Data Protection Act, 2019):
-- All records, individual names, phone numbers, national IDs, and clinical 
-- narratives contained in this seed script are STRICTLY SYNTHETIC and FICTITIOUS, 
-- generated solely for testing, UAT, and system verification purposes. 
-- NO REAL PATIENT DATA IS CONTAINED HEREIN.
-- ==============================================================================

SET search_path = public, extensions;

-- ------------------------------------------------------------------------------
-- Pre-flight Prerequisite Validation Guard
-- ------------------------------------------------------------------------------
DO $$
BEGIN
    IF to_regclass('public.users') IS NULL OR to_regclass('public.system_settings') IS NULL THEN
        RAISE EXCEPTION 'Prerequisite domain tables (public.users, public.system_settings) are missing. Please execute 01_extensions.sql, 02_types_and_enums.sql, and 03_tables.sql prior to running this seed script.';
    END IF;
END $$;

-- ------------------------------------------------------------------------------
-- 1. Master System Settings
-- ------------------------------------------------------------------------------
INSERT INTO public.system_settings (id, setting_key, setting_value, description)
VALUES 
    (gen_random_uuid(), 'facility_name', 'Calyvia Wellness Center', 'Official Facility Legal Name'),
    (gen_random_uuid(), 'facility_location', 'Mugutha, Behind Full Gospel Church, Ruiru, Kiambu County, Kenya', 'Facility Physical Address'),
    (gen_random_uuid(), 'facility_phone', '+254700534306', 'Main Facility Helpline & Admissions Desk'),
    (gen_random_uuid(), 'facility_email', 'info@calyviawellness.co.ke', 'Official Inquiries Email'),
    (gen_random_uuid(), 'default_currency', 'KES', 'Operational Billing Currency (Kenyan Shilling)'),
    (gen_random_uuid(), 'daily_bed_rate_general', '5000.00', 'Standard Daily Bed & Nursing Care Rate'),
    (gen_random_uuid(), 'daily_bed_rate_vip', '12000.00', 'VIP Executive Suite Daily Rate')
ON CONFLICT (setting_key) DO UPDATE SET setting_value = EXCLUDED.setting_value;

-- ------------------------------------------------------------------------------
-- 2. Staff Users & Profiles
-- ------------------------------------------------------------------------------
-- Note: Synthetic Argon2id hash for development/staging password "Clinical#2026"
-- Generated via argon2.hash('Clinical#2026')
-- $argon2id$v=19$m=65536,t=3,p=4$ZTop3yby7kgoIxa67awZvw$eorm7ENyKA7AygopdsoVFM4FJB5RA3ekRhLSDMBSGsw

INSERT INTO public.users (id, email, password_hash, role, full_name, phone, is_active, approval_status)
VALUES 
    ('10000000-0000-0000-0000-000000000001', 'admin@calyviawellness.co.ke', '$argon2id$v=19$m=65536,t=3,p=4$ZTop3yby7kgoIxa67awZvw$eorm7ENyKA7AygopdsoVFM4FJB5RA3ekRhLSDMBSGsw', 'SUPER_ADMIN', 'Antony Kariuki', '+254711000001', true, 'APPROVED'),
    ('10000000-0000-0000-0000-000000000002', 'director@calyviawellness.co.ke', '$argon2id$v=19$m=65536,t=3,p=4$ZTop3yby7kgoIxa67awZvw$eorm7ENyKA7AygopdsoVFM4FJB5RA3ekRhLSDMBSGsw', 'MEDICAL_DIRECTOR', 'Dr. Margaret Nduta', '+254711000002', true, 'APPROVED'),
    ('10000000-0000-0000-0000-000000000003', 'doctor@calyviawellness.co.ke', '$argon2id$v=19$m=65536,t=3,p=4$ZTop3yby7kgoIxa67awZvw$eorm7ENyKA7AygopdsoVFM4FJB5RA3ekRhLSDMBSGsw', 'DOCTOR_PSYCHIATRIST', 'Dr. Faith Mwangi', '+254711000003', true, 'APPROVED'),
    ('10000000-0000-0000-0000-000000000004', 'nurse@calyviawellness.co.ke', '$argon2id$v=19$m=65536,t=3,p=4$ZTop3yby7kgoIxa67awZvw$eorm7ENyKA7AygopdsoVFM4FJB5RA3ekRhLSDMBSGsw', 'NURSE', 'Nurse Beatrice Wanjiku', '+254711000004', true, 'APPROVED'),
    ('10000000-0000-0000-0000-000000000005', 'counsellor@calyviawellness.co.ke', '$argon2id$v=19$m=65536,t=3,p=4$ZTop3yby7kgoIxa67awZvw$eorm7ENyKA7AygopdsoVFM4FJB5RA3ekRhLSDMBSGsw', 'COUNSELLOR', 'David Ochieng', '+254711000005', true, 'APPROVED'),
    ('10000000-0000-0000-0000-000000000006', 'pharmacist@calyviawellness.co.ke', '$argon2id$v=19$m=65536,t=3,p=4$ZTop3yby7kgoIxa67awZvw$eorm7ENyKA7AygopdsoVFM4FJB5RA3ekRhLSDMBSGsw', 'PHARMACIST', 'Mary Njeri', '+254711000006', true, 'APPROVED'),
    ('10000000-0000-0000-0000-000000000007', 'reception@calyviawellness.co.ke', '$argon2id$v=19$m=65536,t=3,p=4$ZTop3yby7kgoIxa67awZvw$eorm7ENyKA7AygopdsoVFM4FJB5RA3ekRhLSDMBSGsw', 'ADMISSIONS_FRONT_DESK', 'Grace Achieng', '+254711000007', true, 'APPROVED'),
    ('10000000-0000-0000-0000-000000000008', 'finance@calyviawellness.co.ke', '$argon2id$v=19$m=65536,t=3,p=4$ZTop3yby7kgoIxa67awZvw$eorm7ENyKA7AygopdsoVFM4FJB5RA3ekRhLSDMBSGsw', 'FINANCE_BILLING', 'Peter Kimani', '+254711000008', true, 'APPROVED')
ON CONFLICT (email) DO UPDATE SET 
    password_hash = EXCLUDED.password_hash,
    approval_status = 'APPROVED',
    is_active = true;

INSERT INTO public.staff_profiles (id, user_id, national_id_encrypted, department, job_title, license_number, license_board, date_joined)
VALUES 
    (gen_random_uuid(), '10000000-0000-0000-0000-000000000002', 'ENC:SYNTHETIC:23489102', 'Clinical Operations', 'Medical Director & Consultant Psychiatrist', 'KMPDC/A/4892', 'Kenya Medical Practitioners and Dentists Council', '2023-01-15'),
    (gen_random_uuid(), '10000000-0000-0000-0000-000000000003', 'ENC:SYNTHETIC:29103841', 'Psychiatry & Detox', 'Resident Medical Officer / Psychiatrist', 'KMPDC/A/7102', 'Kenya Medical Practitioners and Dentists Council', '2023-03-01'),
    (gen_random_uuid(), '10000000-0000-0000-0000-000000000004', 'ENC:SYNTHETIC:25491023', 'Inpatient Nursing', 'Senior Psychiatric Nurse (KRCHN)', 'NCK/RN/19402', 'Nursing Council of Kenya', '2023-02-10'),
    (gen_random_uuid(), '10000000-0000-0000-0000-000000000005', 'ENC:SYNTHETIC:31029481', 'Psychological Therapy', 'Lead Addiction Counsellor & Family Therapist', 'KPA/CP/2091', 'Kenya Psychological Association', '2023-04-01'),
    (gen_random_uuid(), '10000000-0000-0000-0000-000000000006', 'ENC:SYNTHETIC:27401928', 'Pharmacy & Dispensary', 'Registered Clinical Pharmacist', 'PPB/R/5920', 'Pharmacy and Poisons Board', '2023-02-20')
ON CONFLICT (user_id) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 3. Rooms & Beds Hierarchy
-- ------------------------------------------------------------------------------
INSERT INTO public.rooms (id, room_number, room_name, room_type, floor, wing)
VALUES 
    ('20000000-0000-0000-0000-000000000001', 'D-101', 'High Acuity Detox Ward', 'DETOX_WARD', 'Ground', 'East Wing'),
    ('20000000-0000-0000-0000-000000000002', 'M-201', 'Horizon Male Rehabilitation Wing', 'INPATIENT_MALE', '1st Floor', 'North Wing'),
    ('20000000-0000-0000-0000-000000000003', 'F-201', 'Serenity Female Rehabilitation Wing', 'INPATIENT_FEMALE', '1st Floor', 'South Wing'),
    ('20000000-0000-0000-0000-000000000004', 'V-301', 'Executive Recovery Suite', 'VIP_PRIVATE', '2nd Floor', 'Penthouse')
ON CONFLICT (room_number) DO NOTHING;

INSERT INTO public.beds (id, room_id, bed_number, status, daily_rate)
VALUES 
    ('21000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'Detox Bed 1', 'OCCUPIED', 6500.00),
    ('21000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', 'Detox Bed 2', 'AVAILABLE', 6500.00),
    ('21000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000001', 'Detox Bed 3', 'AVAILABLE', 6500.00),
    ('21000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000001', 'Detox Bed 4', 'AVAILABLE', 6500.00),
    ('21000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000002', 'Male Rehab Bed 1', 'OCCUPIED', 5000.00),
    ('21000000-0000-0000-0000-000000000006', '20000000-0000-0000-0000-000000000002', 'Male Rehab Bed 2', 'AVAILABLE', 5000.00),
    ('21000000-0000-0000-0000-000000000007', '20000000-0000-0000-0000-000000000003', 'Female Rehab Bed 1', 'OCCUPIED', 5000.00),
    ('21000000-0000-0000-0000-000000000008', '20000000-0000-0000-0000-000000000003', 'Female Rehab Bed 2', 'AVAILABLE', 5000.00),
    ('21000000-0000-0000-0000-000000000009', '20000000-0000-0000-0000-000000000004', 'VIP Bed 1', 'AVAILABLE', 12000.00)
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 4. Referral Partners
-- ------------------------------------------------------------------------------
INSERT INTO public.referral_partners (id, partner_name, partner_type, contact_person, phone, email, address)
VALUES 
    ('30000000-0000-0000-0000-000000000001', 'Nairobi West Hospital Psychiatric Clinic', 'HOSPITAL', 'Dr. J. Otieno', '+254722000001', 'referrals@nairobiwesthospital.com', 'Nairobi, Kenya'),
    ('30000000-0000-0000-0000-000000000002', 'Kiambu Level 5 Referral Hospital', 'PUBLIC_HEALTH', 'Sister Rose Muthoni', '+254722000002', 'psychiatry@kiambuhospital.go.ke', 'Kiambu Town, Kenya'),
    ('30000000-0000-0000-0000-000000000003', 'Ruiru Community Mental Health Alliance', 'NGO', 'Pastor Samuel Karanja', '+254722000003', 'support@ruirumentalhealth.org', 'Ruiru, Kenya')
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 5. Essential Formulary Medications
-- ------------------------------------------------------------------------------
INSERT INTO public.medications (id, brand_name, generic_name, dosage_form, strength, category, is_controlled_substance, unit_of_measure, unit_price)
VALUES 
    (gen_random_uuid(), 'Valium', 'Diazepam', 'TABLET', '5mg', 'Detoxification / Sedative', true, 'TABLET', 25.00),
    (gen_random_uuid(), 'Ativan', 'Lorazepam', 'TABLET', '2mg', 'Detoxification / Sedative', true, 'TABLET', 35.00),
    (gen_random_uuid(), 'Betaxin', 'Thiamine Hydrochloride', 'TABLET', '100mg', 'Vitamin Supplement', false, 'TABLET', 15.00),
    (gen_random_uuid(), 'Panadol Extra', 'Paracetamol / Caffeine', 'TABLET', '500mg/65mg', 'Analgesic', false, 'TABLET', 10.00),
    (gen_random_uuid(), 'Campral', 'Acamprosate Calcium', 'TABLET', '333mg', 'Anti-Craving Maintenance', false, 'TABLET', 90.00),
    (gen_random_uuid(), 'ReVia', 'Naltrexone Hydrochloride', 'TABLET', '50mg', 'Opioid / Alcohol Antagonist', true, 'TABLET', 120.00)
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 6. Synthetic Patients & Emergency Contacts
-- ------------------------------------------------------------------------------
INSERT INTO public.patients (
    id, upi, first_name, last_name, date_of_birth, gender, 
    national_id_encrypted, phone, email, address, county,
    emergency_contact_name, emergency_contact_phone, emergency_contact_relationship,
    substance_history_encrypted, allergies_encrypted, status
) VALUES 
    (
        '40000000-0000-0000-0000-000000000001', 'CAL-2026-0001', 'John', 'Kamau', '1992-06-14', 'MALE',
        'ENC:SYNTHETIC:29401928', '+254720111001', 'john.kamau.synthetic@test.calyvia.co.ke', 'Mugutha Estate, Ruiru', 'Kiambu',
        'Mary Wanjiru Kamau', '+254720222001', 'Spouse',
        'ENC:SYNTHETIC:Severe Alcohol Dependence (10 yrs), Daily consumption 750ml spirit.', 'ENC:SYNTHETIC:Penicillin rash', 'ADMITTED_DETOX'
    ),
    (
        '40000000-0000-0000-0000-000000000002', 'CAL-2026-0002', 'Sarah', 'Nyambura', '1997-11-22', 'FEMALE',
        'ENC:SYNTHETIC:32019482', '+254720111002', 'sarah.nyambura.synthetic@test.calyvia.co.ke', 'Githurai 44, Nairobi', 'Nairobi',
        'Peter Mwangi Nyambura', '+254720222002', 'Father',
        'ENC:SYNTHETIC:Sedative & Prescription Benzodiazepine dependence (3 yrs).', 'ENC:SYNTHETIC:No known drug allergies (NKDA)', 'ADMITTED_REHAB'
    ),
    (
        '40000000-0000-0000-0000-000000000003', 'CAL-2026-0003', 'Brian', 'Kiprop', '1985-03-08', 'MALE',
        'ENC:SYNTHETIC:24910283', '+254720111003', 'brian.kiprop.synthetic@test.calyvia.co.ke', 'Thika Greens, Thika', 'Kiambu',
        'Gladys Jepkemoi', '+254720222003', 'Sister',
        'ENC:SYNTHETIC:Poly-substance abuse (Alcohol & Opioid taper), History of mild withdrawal seizures.', 'ENC:SYNTHETIC:Sulfonamides', 'ADMITTED_REHAB'
    )
ON CONFLICT (upi) DO NOTHING;

INSERT INTO public.emergency_contacts (id, patient_id, full_name, relationship, phone, is_primary_guarantor)
VALUES 
    (gen_random_uuid(), '40000000-0000-0000-0000-000000000001', 'Mary Wanjiru Kamau', 'Spouse', '+254720222001', true),
    (gen_random_uuid(), '40000000-0000-0000-0000-000000000002', 'Peter Mwangi Nyambura', 'Father', '+254720222002', true),
    (gen_random_uuid(), '40000000-0000-0000-0000-000000000003', 'Gladys Jepkemoi', 'Sister', '+254720222003', true)
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 7. Synthetic Admissions & Bed Allocations
-- ------------------------------------------------------------------------------
INSERT INTO public.admissions (
    id, patient_id, admission_number, admission_date, admission_type, 
    program_type, primary_diagnosis, admitting_staff_id, is_active
) VALUES 
    (
        '50000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001', 'ADM-2026-001', 
        now() - INTERVAL '3 days', 'VOLUNTARY', 'DETOX_ONLY', 'Severe Alcohol Withdrawal Syndrome (ICD-10: F10.23)', 
        '10000000-0000-0000-0000-000000000003', true
    ),
    (
        '50000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000002', 'ADM-2026-002', 
        now() - INTERVAL '14 days', 'FAMILY_ESCORTED', 'REHAB_60_DAYS', 'Sedative/Hypnotic Dependence (ICD-10: F13.20)', 
        '10000000-0000-0000-0000-000000000003', true
    ),
    (
        '50000000-0000-0000-0000-000000000003', '40000000-0000-0000-0000-000000000003', 'ADM-2026-003', 
        now() - INTERVAL '21 days', 'VOLUNTARY', 'REHAB_90_DAYS', 'Poly-substance Dependence in Remission (ICD-10: F19.20)', 
        '10000000-0000-0000-0000-000000000003', true
    )
ON CONFLICT (admission_number) DO NOTHING;

INSERT INTO public.bed_allocations (id, admission_id, bed_id, allocated_at, is_active)
VALUES 
    (gen_random_uuid(), '50000000-0000-0000-0000-000000000001', '21000000-0000-0000-0000-000000000001', now() - INTERVAL '3 days', true),
    (gen_random_uuid(), '50000000-0000-0000-0000-000000000002', '21000000-0000-0000-0000-000000000007', now() - INTERVAL '14 days', true),
    (gen_random_uuid(), '50000000-0000-0000-0000-000000000003', '21000000-0000-0000-0000-000000000005', now() - INTERVAL '21 days', true)
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 8. Synthetic Detox Episode, CIWA Assessment & Vitals Log
-- ------------------------------------------------------------------------------
INSERT INTO public.detox_episodes (
    id, admission_id, protocol_type, start_date, target_substances, 
    baseline_score, current_severity, is_completed
) VALUES (
    '60000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001', 'ALCOHOL_CIWA',
    now() - INTERVAL '3 days', ARRAY['Alcohol'], 18, 'MODERATE', false
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.withdrawal_assessments (
    id, detox_episode_id, assessor_id, score_type, total_score, severity, breakdown, assessed_at
) VALUES (
    gen_random_uuid(), '60000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000004',
    'CIWA_AR', 14, 'MODERATE',
    '{"nausea": 2, "tremor": 3, "sweats": 2, "anxiety": 3, "agitation": 2, "headache": 2, "orientation": 0}'::jsonb,
    now() - INTERVAL '4 hours'
);

INSERT INTO public.vitals_logs (
    id, admission_id, recorded_by_id, recorded_at, systolic_bp, diastolic_bp, 
    pulse_rate, respiratory_rate, temperature_c, oxygen_saturation, is_abnormal
) VALUES 
    (gen_random_uuid(), '50000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000004', now() - INTERVAL '4 hours', 138, 88, 86, 18, 36.8, 98, false),
    (gen_random_uuid(), '50000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000004', now() - INTERVAL '8 hours', 142, 92, 94, 20, 37.1, 97, true);

-- ------------------------------------------------------------------------------
-- 9. Synthetic Clinical Note (Doctor's Note)
-- ------------------------------------------------------------------------------
INSERT INTO public.clinical_notes (
    id, admission_id, author_id, note_type, 
    subjective_narrative_encrypted, objective_narrative_encrypted, 
    assessment_narrative_encrypted, plan_narrative_encrypted, icd10_codes
) VALUES (
    gen_random_uuid(), '50000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000003',
    'DOCTOR_CLINICAL_NOTE',
    'ENC:SYNTHETIC:Patient reports milder morning tremors and reduced nausea after Diazepam 10mg dosing.',
    'ENC:SYNTHETIC:Alert and oriented x3. BP 138/88, HR 86 regular. Mild postural hand tremor noted.',
    'ENC:SYNTHETIC:Day 3 Alcohol Withdrawal with improving CIWA-Ar profile (score 14 down from baseline 18).',
    'ENC:SYNTHETIC:1. Continue Diazepam taper 5mg QDS. 2. Thiamine 100mg OD. 3. High-protein recovery meal plan.',
    ARRAY['F10.23', 'Z71.41']
);

-- ------------------------------------------------------------------------------
-- 10. Synthetic Billing Invoice & Safaricom M-Pesa Payment
-- ------------------------------------------------------------------------------
INSERT INTO public.invoices (
    id, admission_id, invoice_number, issue_date, due_date, status, 
    subtotal, discount, total_amount, balance_due, currency
) VALUES (
    '70000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001', 'INV-2026-0042',
    now() - INTERVAL '2 days', now() + INTERVAL '5 days', 'PARTIALLY_PAID',
    150000.00, 0.00, 150000.00, 100000.00, 'KES'
) ON CONFLICT (invoice_number) DO NOTHING;

INSERT INTO public.invoice_items (id, invoice_id, description, quantity, unit_price, line_total, category)
VALUES 
    (gen_random_uuid(), '70000000-0000-0000-0000-000000000001', 'Inpatient Medical Detox Program (7 Days Full Board)', 1, 45500.00, 45500.00, 'DETOX'),
    (gen_random_uuid(), '70000000-0000-0000-0000-000000000001', 'Psychiatric Admission Assessment & Initial Consultation', 1, 15000.00, 15000.00, 'CONSULTATION'),
    (gen_random_uuid(), '70000000-0000-0000-0000-000000000001', 'Inpatient Rehabilitation Program Deposit (23 Days)', 1, 89500.00, 89500.00, 'REHAB')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.payments (
    id, invoice_id, payment_reference, payment_method, amount_paid, 
    payer_name, payer_phone, receipt_number
) VALUES (
    '80000000-0000-0000-0000-000000000001', '70000000-0000-0000-0000-000000000001', 'PAY-CAL-2026-0091',
    'MPESA_STK', 50000.00, 'Mary Wanjiru Kamau', '+254720222001', 'REC-0091'
) ON CONFLICT (payment_reference) DO NOTHING;

INSERT INTO public.mpesa_transactions (
    id, payment_id, merchant_request_id, checkout_request_id, 
    amount, mpesa_receipt_number, transaction_date, phone_number, result_code, result_desc
) VALUES (
    gen_random_uuid(), '80000000-0000-0000-0000-000000000001',
    '29103-849102-1', 'ws_CO_091020262230001928301',
    50000.00, 'SHK8932J12', now() - INTERVAL '1 day', '+254720222001', 0, 'The service request is processed successfully.'
) ON CONFLICT (checkout_request_id) DO NOTHING;
