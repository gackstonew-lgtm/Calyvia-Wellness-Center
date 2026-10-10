-- ==============================================================================
-- 04_indexes.sql
-- Calyvia Wellness Center Management System (HMIS/EMR)
-- Production Performance & Query Indexes for PostgreSQL 16
-- ==============================================================================

SET search_path = public, extensions;

-- 1. users
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON public.users(is_active);

-- 2. staff_profiles
CREATE INDEX IF NOT EXISTS idx_staff_profiles_department ON public.staff_profiles(department);
CREATE INDEX IF NOT EXISTS idx_staff_profiles_license_expiry ON public.staff_profiles(license_expiry_date);

-- 3. staff_schedules
CREATE INDEX IF NOT EXISTS idx_staff_schedules_staff_profile ON public.staff_schedules(staff_profile_id);
CREATE INDEX IF NOT EXISTS idx_staff_schedules_shift_date ON public.staff_schedules(shift_date);

-- 4. audit_logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON public.audit_logs(entity_name, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON public.audit_logs(timestamp DESC);

-- 5. patients
CREATE INDEX IF NOT EXISTS idx_patients_status ON public.patients(status);
CREATE INDEX IF NOT EXISTS idx_patients_phone ON public.patients(phone);
CREATE INDEX IF NOT EXISTS idx_patients_created_at ON public.patients(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_patients_is_archived ON public.patients(is_archived);

-- 6. emergency_contacts
CREATE INDEX IF NOT EXISTS idx_emergency_contacts_patient_id ON public.emergency_contacts(patient_id);
CREATE INDEX IF NOT EXISTS idx_emergency_contacts_guarantor ON public.emergency_contacts(is_primary_guarantor);

-- 7. leads
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_phone ON public.leads(phone);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads(created_at DESC);

-- 8. admissions
CREATE INDEX IF NOT EXISTS idx_admissions_patient_id ON public.admissions(patient_id);
CREATE INDEX IF NOT EXISTS idx_admissions_is_active ON public.admissions(is_active);
CREATE INDEX IF NOT EXISTS idx_admissions_program_type ON public.admissions(program_type);
CREATE INDEX IF NOT EXISTS idx_admissions_date ON public.admissions(admission_date DESC);

-- 9. beds & allocations
CREATE INDEX IF NOT EXISTS idx_beds_room_id ON public.beds(room_id);
CREATE INDEX IF NOT EXISTS idx_beds_status ON public.beds(status);
CREATE INDEX IF NOT EXISTS idx_bed_allocations_admission_id ON public.bed_allocations(admission_id);
CREATE INDEX IF NOT EXISTS idx_bed_allocations_bed_id ON public.bed_allocations(bed_id);
CREATE INDEX IF NOT EXISTS idx_bed_allocations_is_active ON public.bed_allocations(is_active);

-- 10. clinical_notes
CREATE INDEX IF NOT EXISTS idx_clinical_notes_admission_id ON public.clinical_notes(admission_id);
CREATE INDEX IF NOT EXISTS idx_clinical_notes_author_id ON public.clinical_notes(author_id);
CREATE INDEX IF NOT EXISTS idx_clinical_notes_note_type ON public.clinical_notes(note_type);
CREATE INDEX IF NOT EXISTS idx_clinical_notes_created_at ON public.clinical_notes(created_at DESC);

-- 11. detox_episodes & withdrawal assessments
CREATE INDEX IF NOT EXISTS idx_detox_episodes_admission_id ON public.detox_episodes(admission_id);
CREATE INDEX IF NOT EXISTS idx_detox_episodes_is_completed ON public.detox_episodes(is_completed);
CREATE INDEX IF NOT EXISTS idx_withdrawal_assessments_detox ON public.withdrawal_assessments(detox_episode_id);
CREATE INDEX IF NOT EXISTS idx_withdrawal_assessments_score_type ON public.withdrawal_assessments(score_type);

-- 12. vitals_logs
CREATE INDEX IF NOT EXISTS idx_vitals_logs_admission_id ON public.vitals_logs(admission_id);
CREATE INDEX IF NOT EXISTS idx_vitals_logs_recorded_at ON public.vitals_logs(recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_vitals_logs_is_abnormal ON public.vitals_logs(is_abnormal);

-- 13. counselling_sessions
CREATE INDEX IF NOT EXISTS idx_counselling_sessions_admission_id ON public.counselling_sessions(admission_id);
CREATE INDEX IF NOT EXISTS idx_counselling_sessions_counsellor ON public.counselling_sessions(counsellor_id);
CREATE INDEX IF NOT EXISTS idx_counselling_sessions_date ON public.counselling_sessions(session_date DESC);

-- 14. appointments
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON public.appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_staff_id ON public.appointments(staff_id);
CREATE INDEX IF NOT EXISTS idx_appointments_start_time ON public.appointments(start_time);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON public.appointments(status);

-- 15. medications & pharmacy
CREATE INDEX IF NOT EXISTS idx_medications_category ON public.medications(category);
CREATE INDEX IF NOT EXISTS idx_medications_controlled ON public.medications(is_controlled_substance);
CREATE INDEX IF NOT EXISTS idx_pharmacy_batches_medication ON public.pharmacy_stock_batches(medication_id);
CREATE INDEX IF NOT EXISTS idx_pharmacy_batches_expiry ON public.pharmacy_stock_batches(expiry_date);
CREATE INDEX IF NOT EXISTS idx_prescriptions_admission_id ON public.prescriptions(admission_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_status ON public.prescriptions(status);
CREATE INDEX IF NOT EXISTS idx_prescription_items_prescription ON public.prescription_items(prescription_id);
CREATE INDEX IF NOT EXISTS idx_med_admin_prescription_item ON public.medication_administrations(prescription_item_id);
CREATE INDEX IF NOT EXISTS idx_med_admin_scheduled_time ON public.medication_administrations(scheduled_time);

-- 16. billing & payments
CREATE INDEX IF NOT EXISTS idx_invoices_admission_id ON public.invoices(admission_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON public.invoice_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_invoice_id ON public.payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_mpesa_transactions_checkout_req ON public.mpesa_transactions(checkout_request_id);
CREATE INDEX IF NOT EXISTS idx_mpesa_transactions_receipt ON public.mpesa_transactions(mpesa_receipt_number);

-- 17. movement & visitors
CREATE INDEX IF NOT EXISTS idx_movement_records_admission_id ON public.movement_records(admission_id);
CREATE INDEX IF NOT EXISTS idx_visitor_logs_patient_id ON public.visitor_logs(patient_id);
CREATE INDEX IF NOT EXISTS idx_visitor_logs_visit_date ON public.visitor_logs(visit_date DESC);

-- 18. incidents
CREATE INDEX IF NOT EXISTS idx_incident_reports_severity ON public.incident_reports(severity);
CREATE INDEX IF NOT EXISTS idx_incident_reports_is_resolved ON public.incident_reports(is_resolved);
CREATE INDEX IF NOT EXISTS idx_incident_reports_date ON public.incident_reports(incident_date DESC);

-- 19. staff_tasks
CREATE INDEX IF NOT EXISTS idx_staff_tasks_assigned_to ON public.staff_tasks(assigned_to_id);
CREATE INDEX IF NOT EXISTS idx_staff_tasks_status ON public.staff_tasks(status);
CREATE INDEX IF NOT EXISTS idx_staff_tasks_due_date ON public.staff_tasks(due_date);

-- 20. discharge & aftercare
CREATE INDEX IF NOT EXISTS idx_discharge_records_admission_id ON public.discharge_records(admission_id);
CREATE INDEX IF NOT EXISTS idx_aftercare_plans_patient_id ON public.aftercare_plans(patient_id);
CREATE INDEX IF NOT EXISTS idx_aftercare_plans_is_active ON public.aftercare_plans(is_active);
CREATE INDEX IF NOT EXISTS idx_aftercare_checkins_plan_id ON public.aftercare_checkins(aftercare_plan_id);
CREATE INDEX IF NOT EXISTS idx_aftercare_checkins_milestone ON public.aftercare_checkins(milestone_day);

-- 21. feedback & communication
CREATE INDEX IF NOT EXISTS idx_communication_logs_recipient ON public.communication_logs(recipient_phone);
CREATE INDEX IF NOT EXISTS idx_feedback_surveys_patient_id ON public.feedback_surveys(patient_id);
