'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import {
  Users,
  Activity,
  BedDouble,
  CreditCard,
  Plus,
  ArrowUpRight,
  ShieldCheck,
  Smartphone,
  Pill,
  Clock,
  HeartHandshake,
  CheckCircle2,
  Calendar as CalendarIcon,
  AlertCircle,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Check,
  PhoneCall,
  UserCheck,
  Stethoscope,
  TrendingUp,
  FileText,
  AlertTriangle,
  Building2,
  Sparkles,
  Search,
  Filter,
  Lock,
  Settings,
  BarChart3,
  FileSpreadsheet,
  Download,
  RefreshCw,
  X,
  Shield,
  ArrowRight,
  CheckSquare,
  PackageCheck,
  LogOut,
  Repeat,
  Heart,
  Share2,
  MessageSquare,
  Smile,
  Webhook,
  Zap,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '../components/AuthContext';
import { SignInPage } from '../components/SignInPage';
import { canAccessModule, getDefaultModuleForRole, ROLE_DISPLAY_NAMES } from '@calyvia/shared';

export default function AdminDashboardPage() {
  const { user, isLoading, defaultModule } = useAuth();
  const [activeModule, setActiveModule] = useState<string>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<number>(10);
  const [trendView, setTrendView] = useState<'weekly' | 'monthly'>('weekly');

  // Synchronize active module with authorized role defaults
  useEffect(() => {
    if (user && defaultModule) {
      if (!canAccessModule(user.role, activeModule)) {
        setActiveModule(defaultModule);
      }
    }
  }, [user, defaultModule]);

  // M-Pesa STK Push state for billing demo
  const [stkPhoneNumber, setStkPhoneNumber] = useState<string>('254712345678');
  const [stkAmount, setStkAmount] = useState<string>('45000');
  const [stkStatus, setStkStatus] = useState<string | null>(null);

  // Dynamic Nairobi-time greeting
  const [greeting, setGreeting] = useState<{ salutation: string; message: string }>({
    salutation: 'Good morning',
    message: "Welcome back! Here's what's happening at Calyvia today.",
  });

  // Search & Filter state across modules
  const [patientSearch, setPatientSearch] = useState<string>('');
  const [patientStatusFilter, setPatientStatusFilter] = useState<string>('ALL');
  const [activeModal, setActiveModal] = useState<string | null>(null);

  // Patient Registration Form State
  const [newPatient, setNewPatient] = useState({
    firstName: '',
    lastName: '',
    gender: 'MALE',
    phone: '',
    county: 'Kiambu',
    substance: 'Alcohol',
  });

  // New Appointment Form State
  const [newAppointment, setNewAppointment] = useState({
    title: '',
    patientId: 'CAL-2026-0001',
    staffMemberName: 'Dr. Evelyn Wanjiku',
    appointmentType: 'PSYCHIATRIC_REVIEW',
    time: '10:00 AM',
    location: 'Consultation Suite A',
  });

  // Patients Data State
  const [patients, setPatients] = useState([
    { id: 'CAL-2026-0001', name: 'John Kamau', gender: 'Male', age: 34, phone: '+254712345678', county: 'Kiambu', status: 'ADMITTED_DETOX', ward: 'Detox Ward - Bed 02', doctor: 'Dr. Baraka' },
    { id: 'CAL-2026-0041', name: 'Brian Otieno', gender: 'Male', age: 28, phone: '+254722998877', county: 'Nairobi', status: 'ADMITTED_REHAB', ward: 'Horizon Wing - Bed 05', doctor: 'Dr. Nduta' },
    { id: 'CAL-2026-0052', name: 'Faith Wanjiku', gender: 'Female', age: 41, phone: '+254733445566', county: 'Kiambu', status: 'ADMITTED_REHAB', ward: 'Serenity Wing - Bed 03', doctor: 'Dr. Mwangi' },
    { id: 'CAL-2026-0089', name: 'Peter Mwangi', gender: 'Male', age: 39, phone: '+254701234567', county: 'Murang\'a', status: 'ENQUIRY', ward: 'Unassigned', doctor: 'Triage' },
    { id: 'CAL-2026-0104', name: 'Grace Njeri', gender: 'Female', age: 32, phone: '+254720987654', county: 'Nairobi', status: 'DISCHARGED', ward: 'Aftercare Program', doctor: 'Counsellor David' },
  ]);

  // Appointments Data State
  const [appointments, setAppointments] = useState([
    { id: 'APT-101', time: '08:30 AM', title: 'Morning MDT Clinical Handover', patient: 'Shift MDT Team', doctor: 'Dr. Baraka & Nurse Wangari', type: 'Clinical Handover', status: 'COMPLETED' },
    { id: 'APT-102', time: '09:00 AM', title: 'Detox Protocol CIWA Review', patient: 'John Kamau (CAL-2026-0001)', doctor: 'Dr. Baraka', type: 'CIWA Assessment', status: 'CONFIRMED' },
    { id: 'APT-103', time: '11:30 AM', title: 'CBT Individual Therapy Session', patient: 'Brian Otieno (CAL-2026-0041)', doctor: 'Counsellor David', type: 'Addiction Therapy', status: 'IN_PROGRESS' },
    { id: 'APT-104', time: '02:00 PM', title: 'Sedative Taper Chart Review', patient: 'Faith Wanjiku (CAL-2026-0052)', doctor: 'Dr. Mwangi', type: 'Chart Review', status: 'SCHEDULED' },
    { id: 'APT-105', time: '04:30 PM', title: 'Family Reintegration Conference', patient: 'Kamau Family Group', doctor: 'Dr. Nduta & Counsellor David', type: 'Family Counselling', status: 'SCHEDULED' },
  ]);

  // CRM Leads Data State
  const [leads, setLeads] = useState([
    { id: 'LD-2026-12', name: 'Samson Kariuki', phone: '+254711223344', source: 'Hospital Transfer MoU', substance: 'Opioids / Heroin', stage: 'TRIAGE_PENDING', priority: 'HIGH' },
    { id: 'LD-2026-13', name: 'Alice Mutua', phone: '+254722334455', source: 'Direct Website Enquiry', substance: 'Alcohol Dependence', stage: 'ASSESSMENT_BOOKED', priority: 'MEDIUM' },
    { id: 'LD-2026-14', name: 'Kelvin Ochieng', phone: '+254733445566', source: 'Family Walk-in', substance: 'Sedatives & Alcohol', stage: 'ADMISSION_SCHEDULED', priority: 'URGENT' },
  ]);

  // Clinical Staff Directory
  const staffMembers = [
    { name: 'Dr. Evelyn Wanjiku', role: 'Medical Director & Psychiatrist', board: 'KMPDC', license: 'KMPDC-P5519', expiry: '2027-12-31', status: 'ON_SHIFT', phone: '+254722100201' },
    { name: 'Dr. Antony Baraka', role: 'Clinical Director & Admin', board: 'KMPDC', license: 'KMPDC-P4820', expiry: '2027-08-30', status: 'ON_SHIFT', phone: '+254700534306' },
    { name: 'Dr. David Mwangi', role: 'Medical Officer (Inpatient)', board: 'KMPDC', license: 'KMPDC-M9214', expiry: '2026-11-30', status: 'ON_SHIFT', phone: '+254721456789' },
    { name: 'Nurse Faith Wangari', role: 'Senior Detox Nurse in Charge', board: 'Nursing Council of Kenya', license: 'NCK-RN-28410', expiry: '2027-06-15', status: 'ON_SHIFT', phone: '+254711300403' },
    { name: 'Nurse Beatrice Nyambura', role: 'Staff Nurse (Inpatient)', board: 'Nursing Council of Kenya', license: 'NCK-RN-31502', expiry: '2026-12-31', status: 'OFF_DUTY', phone: '+254724654321' },
    { name: 'Counsellor David Kilonzo', role: 'Lead Addiction Therapist', board: 'KCPA Registered', license: 'KCPA-CT-8104', expiry: '2028-03-31', status: 'ON_SHIFT', phone: '+254733987654' },
  ];

  // Pharmacy Formulary Stock
  const pharmacyStock = [
    { name: 'Diazepam 10mg/2ml Ampoules', category: 'Benzodiazepine / Detox', stock: 14, min: 20, unit: 'Ampoules', status: 'LOW_STOCK' },
    { name: 'Multivitamin Infusion 500ml', category: 'Supportive Care', stock: 45, min: 25, unit: 'Bags', status: 'NOMINAL' },
    { name: 'Clonidine 0.1mg Tablets', category: 'COWS Opioid Taper', stock: 68, min: 30, unit: 'Tablets', status: 'NOMINAL' },
    { name: 'Lorazepam 2mg Tablets', category: 'Sedative Taper', stock: 32, min: 20, unit: 'Tablets', status: 'NOMINAL' },
    { name: 'Thiamine 100mg IV Ampoules', category: 'Wernicke Prevention', stock: 50, min: 20, unit: 'Ampoules', status: 'NOMINAL' },
  ];

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting({
        salutation: 'Good morning',
        message: "Welcome back! Here's what's happening at Calyvia today.",
      });
    } else if (hour < 17) {
      setGreeting({
        salutation: 'Good afternoon',
        message: "Welcome back! Here's the afternoon clinical update at Calyvia.",
      });
    } else {
      setGreeting({
        salutation: 'Good evening',
        message: "Welcome back! Here's the evening handover and census summary.",
      });
    }
  }, []);

  // Trigger demo Safaricom Daraja STK Push
  const handleTriggerMpesaStk = () => {
    setStkStatus('REQUESTED');
    setTimeout(() => {
      setStkStatus('SENT_TO_PHONE');
      setTimeout(() => {
        setStkStatus('SUCCESS');
      }, 2500);
    }, 1200);
  };

  // Handle Register Patient Form Submission
  const handleRegisterPatientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPatient.firstName || !newPatient.lastName) return;

    const created = {
      id: `CAL-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      name: `${newPatient.firstName} ${newPatient.lastName}`,
      gender: newPatient.gender === 'MALE' ? 'Male' : 'Female',
      age: 30,
      phone: newPatient.phone || '+254700000000',
      county: newPatient.county,
      status: 'ENQUIRY',
      ward: 'Unassigned',
      doctor: 'Triage Front Desk',
    };

    setPatients([created, ...patients]);
    setActiveModal(null);
    setNewPatient({ firstName: '', lastName: '', gender: 'MALE', phone: '', county: 'Kiambu', substance: 'Alcohol' });
    alert(`Patient ${created.name} registered successfully with CAL-ID ${created.id}`);
  };

  // Handle Book Appointment Form Submission
  const handleBookAppointmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAppointment.title) return;

    const created = {
      id: `APT-${Math.floor(100 + Math.random() * 900)}`,
      time: newAppointment.time,
      title: newAppointment.title,
      patient: newAppointment.patientId,
      doctor: newAppointment.staffMemberName,
      type: newAppointment.appointmentType,
      status: 'CONFIRMED',
    };

    setAppointments([created, ...appointments]);
    setActiveModal(null);
    setNewAppointment({ title: '', patientId: 'CAL-2026-0001', staffMemberName: 'Dr. Evelyn Wanjiku', appointmentType: 'PSYCHIATRIC_REVIEW', time: '10:00 AM', location: 'Consultation Suite A' });
    alert(`Appointment scheduled for ${created.patient} with ${created.doctor}`);
  };

  // Calendar matrix for October 2026 (Starts on Thursday)
  const calendarDays = [
    { day: null }, { day: null }, { day: null }, { day: null },
    { day: 1, hasEvent: false },
    { day: 2, hasEvent: false },
    { day: 3, hasEvent: true },
    { day: 4, hasEvent: false },
    { day: 5, hasEvent: true },
    { day: 6, hasEvent: false },
    { day: 7, hasEvent: false },
    { day: 8, hasEvent: true },
    { day: 9, hasEvent: false },
    { day: 10, hasEvent: true, isToday: true },
    { day: 11, hasEvent: false },
    { day: 12, hasEvent: true },
    { day: 13, hasEvent: false },
    { day: 14, hasEvent: false },
    { day: 15, hasEvent: true },
    { day: 16, hasEvent: true },
    { day: 17, hasEvent: false },
    { day: 18, hasEvent: false },
    { day: 19, hasEvent: true },
    { day: 20, hasEvent: false },
    { day: 21, hasEvent: false },
    { day: 22, hasEvent: true },
    { day: 23, hasEvent: false },
    { day: 24, hasEvent: false },
    { day: 25, hasEvent: false },
    { day: 26, hasEvent: true },
    { day: 27, hasEvent: false },
    { day: 28, hasEvent: false },
    { day: 29, hasEvent: true },
    { day: 30, hasEvent: false },
    { day: 31, hasEvent: false },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center space-y-4 select-none">
        <div className="w-14 h-14 rounded-2xl bg-primary-soft border border-primary/20 flex items-center justify-center animate-pulse shadow-xs">
          <img src="/brand/calyvia-emblem-light.svg" alt="Calyvia" className="w-8 h-8 object-contain" />
        </div>
        <p className="text-xs text-muted-foreground font-medium animate-pulse">Verifying Calyvia Clinical Session...</p>
      </div>
    );
  }

  if (!user) {
    return <SignInPage />;
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden text-foreground transition-colors duration-200">
      {/* Sidebar navigation with mobile drawer support */}
      <Sidebar
        currentModule={activeModule}
        onSelectModule={setActiveModule}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          onToggleMobileMenu={() => setMobileMenuOpen(true)}
          onSelectModule={setActiveModule}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Executive Overview Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-border/60">
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-primary text-primary-foreground font-mono shadow-xs">
                  FACILITY STATUS: OPERATIONAL
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-primary-soft text-primary border border-primary/20">
                  Ruiru, Kiambu County • Supabase Connected
                </span>
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-foreground mt-2 tracking-tight capitalize">
                {activeModule === 'dashboard' ? 'Dashboard' : `${activeModule.replace('_', ' ')} Management`}
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground font-sans mt-0.5">
                {activeModule === 'dashboard'
                  ? `${greeting.salutation}, ${user.fullName}. ${greeting.message}`
                  : `Calyvia Wellness Center • Enterprise HMIS / EMR System`}
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center space-x-2.5 self-start sm:self-auto">
              <button
                onClick={() => setActiveModal('book_appointment')}
                className="inline-flex items-center space-x-1.5 px-4 py-2.5 bg-primary text-primary-foreground text-xs font-semibold rounded-xl hover:bg-primary-hover hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>New Appointment</span>
              </button>
              <button
                onClick={() => setActiveModal('register_patient')}
                className="inline-flex items-center space-x-1.5 px-4 py-2.5 bg-surface border border-border text-foreground text-xs font-semibold rounded-xl hover:bg-surface-elevated hover:border-primary/40 hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 shadow-xs"
              >
                <UserCheck className="w-4 h-4 text-primary" />
                <span>Register Patient</span>
              </button>
            </div>
          </div>

          {/* Access Control Barrier: Enforce Role Authorization for Module */}
          {!canAccessModule(user.role, activeModule) && (
            <div className="p-8 max-w-lg mx-auto text-center space-y-4 bg-surface border border-border rounded-3xl mt-8 shadow-elevated animate-in fade-in zoom-in-95 duration-150">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-danger-soft border border-danger/20 flex items-center justify-center text-danger">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono uppercase font-bold text-danger tracking-wider">
                  Access Restricted • Least-Privilege Protection
                </span>
                <h2 className="text-lg font-bold text-foreground">Insufficient Role Privileges</h2>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Your authenticated institutional role (<span className="font-semibold text-foreground">{ROLE_DISPLAY_NAMES[user.role] || user.role}</span>) does not have authorized clearance to access the <span className="font-mono text-primary font-semibold">{activeModule}</span> workspace.
                </p>
              </div>
              <div className="pt-2">
                <button
                  onClick={() => setActiveModule(getDefaultModuleForRole(user.role))}
                  className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary-hover shadow-xs transition-all active:scale-[0.98]"
                >
                  Return to Authorized Workspace
                </button>
              </div>
            </div>
          )}

          {/* Module: Dashboard & Management Overview */}
          {activeModule === 'dashboard' && canAccessModule(user.role, 'dashboard') && (
            <div className="space-y-6">
              {/* 4 Metric Overview Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-card p-5 rounded-2xl border border-border shadow-card flex flex-col justify-between hover:border-border-strong hover:shadow-elevated transition-all duration-200 group">
                  <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
                    <span className="text-foreground font-semibold">Total Inpatients</span>
                    <div className="w-8 h-8 rounded-xl bg-primary-soft text-primary flex items-center justify-center group-hover:scale-105 transition-transform">
                      <BedDouble className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="flex items-baseline space-x-2">
                      <span className="text-3xl font-bold font-serif text-foreground">28</span>
                      <span className="text-xs text-muted-foreground font-sans">/ 32 Beds</span>
                    </div>
                    <div className="mt-2.5 flex items-center justify-between text-xs">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-success-soft text-success border border-success/20">
                        <ArrowUpRight className="w-3 h-3 mr-0.5" />
                        87.5% Occupancy
                      </span>
                      <span className="text-[11px] text-muted-foreground">4 available</span>
                    </div>
                  </div>
                </div>

                <div className="bg-card p-5 rounded-2xl border border-border shadow-card flex flex-col justify-between hover:border-border-strong hover:shadow-elevated transition-all duration-200 group">
                  <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
                    <span className="text-foreground font-semibold">Today&apos;s Appointments</span>
                    <div className="w-8 h-8 rounded-xl bg-secondary-soft text-secondary flex items-center justify-center group-hover:scale-105 transition-transform">
                      <CalendarIcon className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="flex items-baseline space-x-2">
                      <span className="text-3xl font-bold font-serif text-foreground">14</span>
                      <span className="text-xs text-muted-foreground font-sans">Scheduled</span>
                    </div>
                    <div className="mt-2.5 flex items-center justify-between text-xs">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-primary-soft text-primary border border-primary/20">
                        <CheckCircle2 className="w-3 h-3 mr-0.5" />
                        8 Completed
                      </span>
                      <span className="text-[11px] text-muted-foreground">6 Pending</span>
                    </div>
                  </div>
                </div>

                <div className="bg-card p-5 rounded-2xl border border-border shadow-card flex flex-col justify-between hover:border-border-strong hover:shadow-elevated transition-all duration-200 group">
                  <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
                    <span className="text-foreground font-semibold">Active Medical Detox</span>
                    <div className="w-8 h-8 rounded-xl bg-accent-soft text-accent flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Activity className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="flex items-baseline space-x-2">
                      <span className="text-3xl font-bold font-serif text-accent">6</span>
                      <span className="text-xs text-muted-foreground font-sans">CIWA / COWS</span>
                    </div>
                    <div className="mt-2.5 flex items-center justify-between text-xs">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-warning-soft text-warning border border-warning/20">
                        <AlertCircle className="w-3 h-3 mr-0.5" />
                        2 Vitals Re-check
                      </span>
                      <span className="text-[11px] text-muted-foreground">&lt; 30m due</span>
                    </div>
                  </div>
                </div>

                <div className="bg-card p-5 rounded-2xl border border-border shadow-card flex flex-col justify-between hover:border-border-strong hover:shadow-elevated transition-all duration-200 group">
                  <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
                    <span className="text-foreground font-semibold">MTD Revenue</span>
                    <div className="w-8 h-8 rounded-xl bg-primary-soft text-primary flex items-center justify-center group-hover:scale-105 transition-transform">
                      <CreditCard className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="flex items-baseline space-x-2">
                      <span className="text-2xl font-bold font-mono text-foreground">KES 3.84M</span>
                    </div>
                    <div className="mt-2.5 flex items-center justify-between text-xs">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-success-soft text-success border border-success/20">
                        <TrendingUp className="w-3 h-3 mr-0.5" />
                        +14.2% vs target
                      </span>
                      <span className="text-[11px] text-muted-foreground">M-Pesa: 68%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Dashboard Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div className="lg:col-span-8 space-y-6">
                  {/* Chart: Clinical Activity */}
                  <div className="bg-card p-5 sm:p-6 rounded-2xl border border-border shadow-card space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div>
                        <h2 className="font-serif text-lg font-bold text-foreground">
                          Clinical Activity & Patient Census Trends
                        </h2>
                        <p className="text-xs text-muted-foreground">
                          Weekly inpatient admissions, consultations, and detox discharges
                        </p>
                      </div>
                      <div className="flex items-center space-x-1.5 bg-surface-subtle p-1 rounded-xl border border-border text-xs">
                        <button
                          onClick={() => setTrendView('weekly')}
                          className={`px-3 py-1 rounded-lg font-medium transition-all ${
                            trendView === 'weekly' ? 'bg-surface text-foreground shadow-xs font-semibold' : 'text-muted-foreground'
                          }`}
                        >
                          Weekly
                        </button>
                        <button
                          onClick={() => setTrendView('monthly')}
                          className={`px-3 py-1 rounded-lg font-medium transition-all ${
                            trendView === 'monthly' ? 'bg-surface text-foreground shadow-xs font-semibold' : 'text-muted-foreground'
                          }`}
                        >
                          Monthly
                        </button>
                      </div>
                    </div>

                    <div className="relative pt-4 pb-2">
                      <div className="h-48 w-full">
                        <svg className="w-full h-full overflow-visible" viewBox="0 0 500 150" preserveAspectRatio="none">
                          <defs>
                            <linearGradient id="primaryAreaGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.25" />
                              <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.0" />
                            </linearGradient>
                          </defs>
                          <line x1="0" y1="30" x2="500" y2="30" stroke="var(--border)" strokeDasharray="3 3" strokeWidth="1" />
                          <line x1="0" y1="75" x2="500" y2="75" stroke="var(--border)" strokeDasharray="3 3" strokeWidth="1" />
                          <line x1="0" y1="120" x2="500" y2="120" stroke="var(--border)" strokeDasharray="3 3" strokeWidth="1" />
                          <path d="M 0 110 Q 80 40, 160 70 T 330 45 T 500 20 L 500 150 L 0 150 Z" fill="url(#primaryAreaGrad)" />
                          <path d="M 0 110 Q 80 40, 160 70 T 330 45 T 500 20" fill="none" stroke="var(--primary)" strokeWidth="2.5" />
                          <circle cx="160" cy="70" r="4" fill="var(--primary)" />
                          <circle cx="330" cy="45" r="4" fill="var(--primary)" />
                          <circle cx="500" cy="20" r="5" fill="var(--primary)" />
                        </svg>
                      </div>
                      <div className="flex justify-between text-[11px] text-muted-foreground pt-2 border-t border-border/40 font-mono">
                        <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                      </div>
                    </div>
                  </div>

                  {/* Ward Census */}
                  <div className="bg-card p-5 sm:p-6 rounded-2xl border border-border shadow-card space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="font-serif text-lg font-bold text-foreground">
                          Inpatient Ward Census & Capacity Allocation
                        </h2>
                        <p className="text-xs text-muted-foreground">Real-time room occupancy in Ruiru center</p>
                      </div>
                      <button onClick={() => setActiveModule('rooms')} className="text-xs text-primary font-semibold hover:underline">
                        Manage Beds &rarr;
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                      <div className="p-3.5 rounded-xl bg-surface-subtle border border-border space-y-2">
                        <div className="flex justify-between items-center font-semibold">
                          <span>Detox Ward</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-bold bg-accent-soft text-accent">100%</span>
                        </div>
                        <div className="w-full bg-border rounded-full h-1.5 overflow-hidden">
                          <div className="bg-accent h-1.5 rounded-full w-full" />
                        </div>
                        <div className="flex justify-between text-[11px] text-muted-foreground">
                          <span>6/6 Beds</span>
                          <span className="text-accent font-medium">Full Acuity</span>
                        </div>
                      </div>

                      <div className="p-3.5 rounded-xl bg-surface-subtle border border-border space-y-2">
                        <div className="flex justify-between items-center font-semibold">
                          <span>Horizon (Male)</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-bold bg-primary-soft text-primary">87.5%</span>
                        </div>
                        <div className="w-full bg-border rounded-full h-1.5 overflow-hidden">
                          <div className="bg-primary h-1.5 rounded-full w-[87.5%]" />
                        </div>
                        <div className="flex justify-between text-[11px] text-muted-foreground">
                          <span>14/16 Beds</span>
                          <span className="text-primary font-medium">2 Avail.</span>
                        </div>
                      </div>

                      <div className="p-3.5 rounded-xl bg-surface-subtle border border-border space-y-2">
                        <div className="flex justify-between items-center font-semibold">
                          <span>Serenity (Female)</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-bold bg-secondary-soft text-secondary">75%</span>
                        </div>
                        <div className="w-full bg-border rounded-full h-1.5 overflow-hidden">
                          <div className="bg-secondary h-1.5 rounded-full w-[75%]" />
                        </div>
                        <div className="flex justify-between text-[11px] text-muted-foreground">
                          <span>6/8 Beds</span>
                          <span className="text-secondary font-medium">2 Avail.</span>
                        </div>
                      </div>

                      <div className="p-3.5 rounded-xl bg-surface-subtle border border-border space-y-2">
                        <div className="flex justify-between items-center font-semibold">
                          <span>VIP Suite</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-bold bg-accent-soft text-accent">100%</span>
                        </div>
                        <div className="w-full bg-border rounded-full h-1.5 overflow-hidden">
                          <div className="bg-accent h-1.5 rounded-full w-full" />
                        </div>
                        <div className="flex justify-between text-[11px] text-muted-foreground">
                          <span>2/2 Beds</span>
                          <span className="text-muted-foreground">Occupied</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Today's Appointments List */}
                  <div className="bg-card rounded-2xl border border-border shadow-card overflow-hidden">
                    <div className="p-4 sm:p-5 bg-surface-subtle border-b border-border flex items-center justify-between">
                      <div>
                        <h2 className="font-serif text-base font-bold text-foreground">
                          Today&apos;s Appointments & Clinical Consultations
                        </h2>
                        <p className="text-[11px] text-muted-foreground">
                          Scheduled psychiatric evaluations, individual therapy, and medical reviews
                        </p>
                      </div>
                      <button onClick={() => setActiveModule('appointments')} className="text-xs text-primary font-semibold hover:underline">
                        View All ({appointments.length}) &rarr;
                      </button>
                    </div>

                    <div className="divide-y divide-border text-xs">
                      {appointments.slice(0, 3).map((apt) => (
                        <div key={apt.id} className="p-4 flex items-center justify-between gap-4 hover:bg-surface-subtle/60 transition-colors">
                          <div className="flex items-center space-x-3 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-primary-soft text-primary font-bold flex items-center justify-center flex-shrink-0 shadow-xs">
                              {apt.patient.substring(0, 2).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <div className="font-semibold text-foreground flex items-center space-x-2">
                                <span>{apt.patient}</span>
                                <span className="text-[10px] font-mono text-muted-foreground">{apt.id}</span>
                              </div>
                              <div className="text-[11px] text-muted-foreground mt-0.5">
                                <span>{apt.title}</span> • <span>{apt.doctor}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3 flex-shrink-0">
                            <div className="text-right">
                              <div className="font-mono text-xs font-semibold text-foreground">{apt.time}</div>
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-success-soft text-success border border-success/20">
                                {apt.status}
                              </span>
                            </div>
                            <button
                              onClick={() => setActiveModule('appointments')}
                              className="px-3 py-1.5 bg-surface border border-border hover:bg-surface-elevated text-foreground rounded-lg font-medium text-xs transition shadow-xs"
                            >
                              Details
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Column: Mini Calendar & Agenda */}
                <div className="lg:col-span-4 space-y-6">
                  {/* Calendar Widget */}
                  <div className="bg-card p-5 rounded-2xl border border-border shadow-card space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <CalendarIcon className="w-4 h-4 text-primary" />
                        <h3 className="font-serif text-base font-bold text-foreground">October 2026</h3>
                      </div>
                      <div className="flex items-center space-x-1">
                        <button className="p-1.5 rounded-lg border border-border text-muted-foreground"><ChevronLeft className="w-3.5 h-3.5" /></button>
                        <button className="p-1.5 rounded-lg border border-border text-muted-foreground"><ChevronRight className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>

                    <div className="grid grid-cols-7 text-center text-[11px] font-semibold text-muted-foreground">
                      <span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span>
                    </div>

                    <div className="grid grid-cols-7 gap-1 text-center text-xs">
                      {calendarDays.map((item, index) => {
                        if (!item.day) return <div key={`empty-${index}`} className="h-8" />;
                        const isSelected = selectedCalendarDate === item.day;
                        return (
                          <button
                            key={`day-${item.day}`}
                            onClick={() => setSelectedCalendarDate(item.day)}
                            className={`h-8 w-8 mx-auto rounded-xl flex flex-col items-center justify-center transition-all ${
                              isSelected ? 'bg-primary text-primary-foreground font-bold shadow-xs' : 'text-foreground hover:bg-surface-subtle'
                            }`}
                          >
                            <span>{item.day}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Facility Quick Operations */}
                  <div className="bg-card p-5 rounded-2xl border border-border shadow-card space-y-3.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground">Facility Operations</span>
                      <span className="text-[10px] font-mono text-emerald-500 font-bold">All Nominal</span>
                    </div>
                    <div className="space-y-2">
                      <div className="p-2.5 rounded-xl bg-surface-subtle border border-border flex items-center justify-between">
                        <span className="text-foreground">Clinical Staff on Duty</span>
                        <span className="font-bold font-mono text-foreground">14 Active</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-surface-subtle border border-border flex items-center justify-between">
                        <span className="text-foreground">Pharmacy In-Stock</span>
                        <span className="font-bold font-mono text-emerald-500">98.2%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Module: 01. Patient Registry */}
          {activeModule === 'patients' && (
            <div className="space-y-6">
              <div className="bg-card p-6 rounded-2xl border border-border shadow-card space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h2 className="font-serif text-xl font-bold text-foreground">Master Patient Index & Registry</h2>
                    <p className="text-xs text-muted-foreground">KDPA 2019 encrypted patient identity and admission profiles</p>
                  </div>
                  <button
                    onClick={() => setActiveModal('register_patient')}
                    className="inline-flex items-center space-x-1.5 px-4 py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-xl hover:bg-primary-hover shadow-xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Register Patient</span>
                  </button>
                </div>

                {/* Search & Filter Bar */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search patient by CAL-ID, name, or phone..."
                      value={patientSearch}
                      onChange={(e) => setPatientSearch(e.target.value)}
                      className="w-full bg-surface-subtle border border-border rounded-xl pl-9 pr-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary"
                    />
                  </div>
                  <select
                    value={patientStatusFilter}
                    onChange={(e) => setPatientStatusFilter(e.target.value)}
                    className="bg-surface-subtle border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none"
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="ADMITTED_DETOX">Admitted (Detox)</option>
                    <option value="ADMITTED_REHAB">Admitted (Rehab)</option>
                    <option value="ENQUIRY">Enquiry / Triage</option>
                    <option value="DISCHARGED">Discharged</option>
                  </select>
                </div>

                {/* Patient Table */}
                <div className="overflow-x-auto rounded-xl border border-border mt-3">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-surface-elevated text-muted-foreground uppercase text-[10px] tracking-wider font-semibold border-b border-border">
                      <tr>
                        <th className="px-4 py-3">CAL-ID & Name</th>
                        <th className="px-4 py-3">Gender / Age</th>
                        <th className="px-4 py-3">Phone & County</th>
                        <th className="px-4 py-3">Admission Status</th>
                        <th className="px-4 py-3">Ward / Bed</th>
                        <th className="px-4 py-3">MDT Lead</th>
                        <th className="px-4 py-3">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {patients
                        .filter((p) => {
                          const matchesSearch = p.name.toLowerCase().includes(patientSearch.toLowerCase()) || p.id.toLowerCase().includes(patientSearch.toLowerCase());
                          const matchesStatus = patientStatusFilter === 'ALL' || p.status === patientStatusFilter;
                          return matchesSearch && matchesStatus;
                        })
                        .map((p) => (
                          <tr key={p.id} className="hover:bg-surface-subtle transition-colors">
                            <td className="px-4 py-3">
                              <div className="font-semibold text-foreground">{p.name}</div>
                              <div className="text-[10px] font-mono text-muted-foreground">{p.id}</div>
                            </td>
                            <td className="px-4 py-3 text-muted-foreground">{p.gender}, {p.age} yrs</td>
                            <td className="px-4 py-3">
                              <div className="font-mono text-[11px]">{p.phone}</div>
                              <div className="text-[10px] text-muted-foreground">{p.county}</div>
                            </td>
                            <td className="px-4 py-3">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary-soft text-primary">
                                {p.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-foreground font-medium">{p.ward}</td>
                            <td className="px-4 py-3 text-muted-foreground">{p.doctor}</td>
                            <td className="px-4 py-3">
                              <button
                                onClick={() => setActiveModule('clinical')}
                                className="px-2.5 py-1 bg-surface border border-border rounded-lg text-[11px] font-semibold hover:bg-surface-elevated"
                              >
                                View Chart
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Module: 02. CRM & Admissions Pipeline */}
          {activeModule === 'crm' && (
            <div className="space-y-6">
              <div className="bg-card p-6 rounded-2xl border border-border shadow-card space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-serif text-xl font-bold text-foreground">CRM Admissions Pipeline & Triage</h2>
                    <p className="text-xs text-muted-foreground">Prospective patient intake, referral tracking, and bed reservation</p>
                  </div>
                  <button
                    onClick={() => setActiveModal('register_patient')}
                    className="inline-flex items-center space-x-1.5 px-4 py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-xl hover:bg-primary-hover shadow-xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>New Lead</span>
                  </button>
                </div>

                {/* Pipeline Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
                  <div className="p-4 rounded-xl bg-surface-subtle border border-border">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground">New Enquiries</span>
                    <div className="text-2xl font-bold font-serif text-foreground mt-1">12</div>
                    <span className="text-[10px] text-primary">This week</span>
                  </div>
                  <div className="p-4 rounded-xl bg-surface-subtle border border-border">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground">Triage Pending</span>
                    <div className="text-2xl font-bold font-serif text-warning mt-1">5</div>
                    <span className="text-[10px] text-warning">High Priority</span>
                  </div>
                  <div className="p-4 rounded-xl bg-surface-subtle border border-border">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground">Assessment Booked</span>
                    <div className="text-2xl font-bold font-serif text-secondary mt-1">3</div>
                    <span className="text-[10px] text-secondary">Scheduled</span>
                  </div>
                  <div className="p-4 rounded-xl bg-surface-subtle border border-border">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground">Formally Admitted</span>
                    <div className="text-2xl font-bold font-serif text-success mt-1">28</div>
                    <span className="text-[10px] text-success">Active Census</span>
                  </div>
                </div>

                {/* Leads Table */}
                <div className="overflow-x-auto rounded-xl border border-border mt-4">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-surface-elevated text-muted-foreground uppercase text-[10px] tracking-wider font-semibold border-b border-border">
                      <tr>
                        <th className="px-4 py-3">Lead ID & Client</th>
                        <th className="px-4 py-3">Phone</th>
                        <th className="px-4 py-3">Referral Channel</th>
                        <th className="px-4 py-3">Primary Substance</th>
                        <th className="px-4 py-3">Pipeline Stage</th>
                        <th className="px-4 py-3">Priority</th>
                        <th className="px-4 py-3">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {leads.map((l) => (
                        <tr key={l.id} className="hover:bg-surface-subtle transition-colors">
                          <td className="px-4 py-3 font-semibold text-foreground">
                            <div>{l.name}</div>
                            <span className="text-[10px] font-mono text-muted-foreground">{l.id}</span>
                          </td>
                          <td className="px-4 py-3 font-mono">{l.phone}</td>
                          <td className="px-4 py-3 text-muted-foreground">{l.source}</td>
                          <td className="px-4 py-3">{l.substance}</td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-secondary-soft text-secondary">
                              {l.stage}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-warning-soft text-warning">
                              {l.priority}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => {
                                alert(`Admitting ${l.name} into Calyvia Inpatient Registry.`);
                                setActiveModule('rooms');
                              }}
                              className="px-2.5 py-1 bg-primary text-primary-foreground rounded-lg text-[11px] font-semibold hover:bg-primary-hover shadow-xs"
                            >
                              Admit Patient
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Module: 06. Appointments & Calendar */}
          {activeModule === 'appointments' && (
            <div className="space-y-6">
              <div className="bg-card p-6 rounded-2xl border border-border shadow-card space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h2 className="font-serif text-xl font-bold text-foreground">Appointments & Clinical Calendar</h2>
                    <p className="text-xs text-muted-foreground">Manage multidisciplinary psychiatric consultations and therapy schedules</p>
                  </div>
                  <button
                    onClick={() => setActiveModal('book_appointment')}
                    className="inline-flex items-center space-x-1.5 px-4 py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-xl hover:bg-primary-hover shadow-xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Schedule Appointment</span>
                  </button>
                </div>

                <div className="overflow-x-auto rounded-xl border border-border mt-3">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-surface-elevated text-muted-foreground uppercase text-[10px] tracking-wider font-semibold border-b border-border">
                      <tr>
                        <th className="px-4 py-3">Time & ID</th>
                        <th className="px-4 py-3">Session Title</th>
                        <th className="px-4 py-3">Patient / Attendee</th>
                        <th className="px-4 py-3">Clinician in Charge</th>
                        <th className="px-4 py-3">Type</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {appointments.map((a) => (
                        <tr key={a.id} className="hover:bg-surface-subtle transition-colors">
                          <td className="px-4 py-3 font-mono font-semibold text-foreground">
                            <div>{a.time}</div>
                            <span className="text-[10px] text-muted-foreground">{a.id}</span>
                          </td>
                          <td className="px-4 py-3 font-semibold text-foreground">{a.title}</td>
                          <td className="px-4 py-3 text-muted-foreground">{a.patient}</td>
                          <td className="px-4 py-3 text-foreground font-medium">{a.doctor}</td>
                          <td className="px-4 py-3 text-muted-foreground">{a.type}</td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-success-soft text-success border border-success/20">
                              {a.status}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => alert(`Opening appointment chart for ${a.id}`)}
                              className="px-2.5 py-1 bg-surface border border-border text-foreground rounded-lg text-[11px] font-semibold hover:bg-surface-elevated"
                            >
                              Manage
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Module: 03. Clinical Records & MDT */}
          {activeModule === 'clinical' && (
            <div className="space-y-6">
              <div className="bg-card p-6 rounded-2xl border border-border shadow-card space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-serif text-xl font-bold text-foreground">Clinical Records & MDT Progress Notes</h2>
                    <p className="text-xs text-muted-foreground">Versioned psychiatric evaluations, nursing charts, and SOAP progress documentation</p>
                  </div>
                  <button
                    onClick={() => alert('Add Clinical Note dialog opened.')}
                    className="inline-flex items-center space-x-1.5 px-4 py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-xl hover:bg-primary-hover shadow-xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Append Clinical Note</span>
                  </button>
                </div>

                <div className="space-y-4 pt-2">
                  <div className="p-4 rounded-xl bg-surface-subtle border border-border space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-foreground">John Kamau (CAL-2026-0001)</span>
                        <span className="text-muted-foreground">• Inpatient Detox Day 3</span>
                      </div>
                      <span className="font-mono text-[11px] text-muted-foreground">Today @ 09:30 AM</span>
                    </div>
                    <div className="space-y-1 text-muted-foreground">
                      <p><strong className="text-foreground">S (Subjective):</strong> Patient reports tremors and mild anxiety after sleeping 5 hours.</p>
                      <p><strong className="text-foreground">O (Objective):</strong> BP 138/88 mmHg, HR 94 bpm, SpO2 98%. Moderate postural tremor noted.</p>
                      <p><strong className="text-foreground">A (Assessment):</strong> Alcohol Withdrawal Syndrome — CIWA-Ar score 18 (Moderate).</p>
                      <p><strong className="text-foreground">P (Plan):</strong> Continue Diazepam 10mg PO titration per protocol. Vitals Q2H. Reassess afternoon.</p>
                    </div>
                    <div className="pt-1 text-[11px] text-secondary font-medium">Signed: Dr. Antony Baraka (KMPDC-P4820)</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Module: 08. Pharmacy & e-MAR Chart */}
          {activeModule === 'pharmacy' && (
            <div className="space-y-6">
              <div className="bg-card p-6 rounded-2xl border border-border shadow-card space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-serif text-xl font-bold text-foreground">Pharmacy Formulary & e-MAR Medication Chart</h2>
                    <p className="text-xs text-muted-foreground">Controlled substance inventory batches, re-order levels, and shift dispensation</p>
                  </div>
                  <button
                    onClick={() => alert('Issue Prescription modal opened.')}
                    className="inline-flex items-center space-x-1.5 px-4 py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-xl hover:bg-primary-hover shadow-xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Issue Prescription</span>
                  </button>
                </div>

                <div className="overflow-x-auto rounded-xl border border-border mt-3">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-surface-elevated text-muted-foreground uppercase text-[10px] tracking-wider font-semibold border-b border-border">
                      <tr>
                        <th className="px-4 py-3">Medication Name</th>
                        <th className="px-4 py-3">Therapeutic Class</th>
                        <th className="px-4 py-3">Stock on Hand</th>
                        <th className="px-4 py-3">Re-order Threshold</th>
                        <th className="px-4 py-3">Unit</th>
                        <th className="px-4 py-3">Inventory Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {pharmacyStock.map((med, idx) => (
                        <tr key={idx} className="hover:bg-surface-subtle transition-colors">
                          <td className="px-4 py-3 font-semibold text-foreground">{med.name}</td>
                          <td className="px-4 py-3 text-muted-foreground">{med.category}</td>
                          <td className="px-4 py-3 font-mono font-bold text-foreground">{med.stock}</td>
                          <td className="px-4 py-3 font-mono text-muted-foreground">{med.min}</td>
                          <td className="px-4 py-3 text-muted-foreground">{med.unit}</td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                med.status === 'LOW_STOCK'
                                  ? 'bg-warning-soft text-warning border border-warning/20'
                                  : 'bg-success-soft text-success border border-success/20'
                              }`}
                            >
                              {med.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Module: 09. Rooms & Bed Allocation */}
          {activeModule === 'rooms' && (
            <div className="space-y-6">
              <div className="bg-card p-6 rounded-2xl border border-border shadow-card space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-serif text-xl font-bold text-foreground">Inpatient Rooms & Bed Allocation Board</h2>
                    <p className="text-xs text-muted-foreground">Live ward capacity, bed occupancy, and patient transfer controls</p>
                  </div>
                  <div className="text-xs font-mono font-semibold text-primary">Total: 28/32 Beds Occupied</div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 rounded-xl bg-surface-subtle border border-border space-y-3">
                    <div className="flex items-center justify-between font-semibold">
                      <span className="text-foreground">Detox Ward (High Acuity)</span>
                      <span className="text-accent text-xs">6 / 6 Beds (Full)</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      {[1, 2, 3, 4, 5, 6].map((b) => (
                        <div key={b} className="p-2 rounded-lg bg-surface border border-accent/30 text-center">
                          <span className="font-mono font-bold text-accent">Bed 0{b}</span>
                          <div className="text-[10px] text-muted-foreground truncate">Occupied</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-surface-subtle border border-border space-y-3">
                    <div className="flex items-center justify-between font-semibold">
                      <span className="text-foreground">Horizon Wing (Male Inpatient)</span>
                      <span className="text-primary text-xs">14 / 16 Beds (2 Avail)</span>
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-xs">
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((b) => (
                        <div key={b} className="p-2 rounded-lg bg-surface border border-border text-center">
                          <span className="font-mono font-semibold text-foreground">Bed 0{b}</span>
                          <div className="text-[10px] text-muted-foreground">{b > 6 ? 'Available' : 'Occupied'}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Module: 12. Staff & Licence Roster */}
          {activeModule === 'staff' && (
            <div className="space-y-6">
              <div className="bg-card p-6 rounded-2xl border border-border shadow-card space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-serif text-xl font-bold text-foreground">Clinical Staff Directory & Licensing Roster</h2>
                    <p className="text-xs text-muted-foreground">KMPDC and Nursing Council of Kenya regulatory license audit</p>
                  </div>
                  <span className="px-3 py-1 bg-success-soft text-success text-xs font-bold rounded-full">
                    All Licences Compliant
                  </span>
                </div>

                <div className="overflow-x-auto rounded-xl border border-border mt-3">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-surface-elevated text-muted-foreground uppercase text-[10px] tracking-wider font-semibold border-b border-border">
                      <tr>
                        <th className="px-4 py-3">Practitioner Name</th>
                        <th className="px-4 py-3">Role & Department</th>
                        <th className="px-4 py-3">Licensing Board</th>
                        <th className="px-4 py-3">Licence ID</th>
                        <th className="px-4 py-3">Expiry Date</th>
                        <th className="px-4 py-3">Duty Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {staffMembers.map((s, idx) => (
                        <tr key={idx} className="hover:bg-surface-subtle transition-colors">
                          <td className="px-4 py-3 font-semibold text-foreground">{s.name}</td>
                          <td className="px-4 py-3 text-muted-foreground">{s.role}</td>
                          <td className="px-4 py-3 text-foreground">{s.board}</td>
                          <td className="px-4 py-3 font-mono">{s.license}</td>
                          <td className="px-4 py-3 font-mono">{s.expiry}</td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary-soft text-primary">
                              {s.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Module: 07. Billing & Daraja M-Pesa Integration Demo */}
          {activeModule === 'billing' && (
            <div className="bg-card p-6 sm:p-8 rounded-2xl border border-border shadow-card space-y-6">
              <div>
                <h2 className="font-serif text-xl font-bold text-foreground">
                  Module 07: Billing & Safaricom Daraja M-Pesa Integration
                </h2>
                <p className="text-xs text-muted-foreground">
                  Collect rehab deposits, consultation fees, and pharmacy disbursements directly to Calyvia Till / Paybill
                </p>
              </div>

              <div className="max-w-md bg-surface-subtle p-6 rounded-2xl border border-border space-y-4 text-xs">
                <div className="space-y-3.5">
                  <div>
                    <label className="block text-foreground font-semibold mb-1.5">
                      Patient Safaricom Phone Number
                    </label>
                    <input
                      type="text"
                      value={stkPhoneNumber}
                      onChange={(e) => setStkPhoneNumber(e.target.value)}
                      className="w-full bg-surface border border-border rounded-xl p-2.5 font-mono text-xs text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-foreground font-semibold mb-1.5">
                      Billing Amount in Kenya Shillings (KES)
                    </label>
                    <input
                      type="number"
                      value={stkAmount}
                      onChange={(e) => setStkAmount(e.target.value)}
                      className="w-full bg-surface border border-border rounded-xl p-2.5 font-mono text-xs text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={handleTriggerMpesaStk}
                      className="w-full py-3 bg-primary hover:bg-primary-hover active:scale-[0.98] text-primary-foreground font-semibold rounded-xl text-xs transition-all duration-200 shadow-xs flex items-center justify-center space-x-2"
                    >
                      <Smartphone className="w-4 h-4" />
                      <span>Send M-Pesa Prompt (KES {Number(stkAmount).toLocaleString()})</span>
                    </button>
                  </div>

                  {stkStatus && (
                    <div className="mt-4 p-3.5 rounded-xl border border-border text-xs font-mono">
                      {stkStatus === 'REQUESTED' && (
                        <div className="text-warning bg-warning-soft border border-warning/20 p-2.5 rounded-xl">
                          Handshaking with Safaricom Daraja API gateway...
                        </div>
                      )}
                      {stkStatus === 'SENT_TO_PHONE' && (
                        <div className="text-info bg-info-soft border border-info/20 p-2.5 rounded-xl animate-pulse">
                          STK Push prompt sent to {stkPhoneNumber}. Awaiting PIN entry...
                        </div>
                      )}
                      {stkStatus === 'SUCCESS' && (
                        <div className="text-success bg-success-soft border border-success/30 p-3.5 rounded-xl">
                          <div className="font-bold flex items-center">
                            <CheckCircle2 className="w-4 h-4 mr-1.5 text-success" />
                            PAYMENT CONFIRMED (M-Pesa Code: SHB94819KL)
                          </div>
                          <div className="mt-1 text-[11px] opacity-90">
                            KES {Number(stkAmount).toLocaleString()} received and allocated to Invoice INV-2026-0042.
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Module: 04. Detox Management (CIWA/COWS) */}
          {activeModule === 'detox' && (
            <div className="bg-card p-6 sm:p-8 rounded-2xl border border-border shadow-card space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <h2 className="font-serif text-xl font-bold text-foreground">
                    Clinical Detoxification Assessment & Protocol Calculator
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Clinical Institute Withdrawal Assessment for Alcohol (CIWA-Ar) & Clinical Opiate Withdrawal Scale (COWS)
                  </p>
                </div>
                <span className="px-3 py-1 bg-accent-soft text-accent text-xs font-bold rounded-full border border-accent/20 self-start sm:self-auto">
                  High Acuity Protocol
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-sans mt-4">
                <div className="p-4 bg-surface-subtle rounded-xl border border-border">
                  <h3 className="font-bold text-foreground text-sm">Nausea & Vomiting (0-7)</h3>
                  <p className="text-muted-foreground text-[11px] mt-1">Currently scored: 3 (Mild nausea with dry heaves)</p>
                </div>
                <div className="p-4 bg-surface-subtle rounded-xl border border-border">
                  <h3 className="font-bold text-foreground text-sm">Tremors (0-7)</h3>
                  <p className="text-muted-foreground text-[11px] mt-1">Currently scored: 4 (Moderate with arms extended)</p>
                </div>
                <div className="p-4 bg-surface-subtle rounded-xl border border-border">
                  <h3 className="font-bold text-foreground text-sm">Paroxysmal Sweats (0-7)</h3>
                  <p className="text-muted-foreground text-[11px] mt-1">Currently scored: 3 (Beads of sweat obvious on forehead)</p>
                </div>
              </div>
            </div>
          )}

          {/* Module: 28. Calyvia AI Extension Boundary & Institutional Copilot */}
          {activeModule === 'ai_extension' && (
            <div className="space-y-6">
              <div className="bg-card p-6 sm:p-8 rounded-2xl border border-border shadow-card space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-xs">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="font-serif text-xl font-bold text-foreground">
                        Module 28: Calyvia AI Institutional Management Copilot
                      </h2>
                      <p className="text-xs text-muted-foreground">
                        Context-aware administrative assistant grounded in live Supabase PostgreSQL and clinical workflows
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      STATUS: ONLINE
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-primary-soft text-primary border border-primary/20">
                      KDPA 2019
                    </span>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed pt-2">
                  The Calyvia AI Assistant is accessible as a persistent floating copilot across the bottom-right corner of all authenticated pages. It executes read-only database tools, computes real-time operational summaries, assists with scheduling, and provides guidance across all 28 Calyvia modules.
                </p>
              </div>

              {/* Tools Architecture & Live Data Connectors */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                <div className="bg-card p-5 rounded-2xl border border-border shadow-card space-y-2">
                  <div className="flex items-center space-x-2 text-primary font-semibold">
                    <BedDouble className="w-4 h-4" />
                    <span>get_dashboard_summary</span>
                  </div>
                  <p className="text-muted-foreground text-[11px]">
                    Reads live bed census (28/32 beds), ward occupancy (87.5%), active detox count (6), and daily therapy sessions (14).
                  </p>
                  <span className="text-[10px] font-mono text-emerald-500">Live Supabase Pooler</span>
                </div>

                <div className="bg-card p-5 rounded-2xl border border-border shadow-card space-y-2">
                  <div className="flex items-center space-x-2 text-secondary font-semibold">
                    <CalendarIcon className="w-4 h-4" />
                    <span>get_appointments_summary</span>
                  </div>
                  <p className="text-muted-foreground text-[11px]">
                    Inspects today&apos;s clinical consultations, MDT reviews, therapy schedules, and clinician assignments.
                  </p>
                  <span className="text-[10px] font-mono text-emerald-500">Live Supabase Pooler</span>
                </div>

                <div className="bg-card p-5 rounded-2xl border border-border shadow-card space-y-2">
                  <div className="flex items-center space-x-2 text-accent font-semibold">
                    <Activity className="w-4 h-4" />
                    <span>get_patient_statistics</span>
                  </div>
                  <p className="text-muted-foreground text-[11px]">
                    Aggregates privacy-preserving census statistics, triage intake pipeline, and ward allocation without exposing PII.
                  </p>
                  <span className="text-[10px] font-mono text-emerald-500">KDPA Masked</span>
                </div>

                <div className="bg-card p-5 rounded-2xl border border-border shadow-card space-y-2">
                  <div className="flex items-center space-x-2 text-primary font-semibold">
                    <CreditCard className="w-4 h-4" />
                    <span>get_billing_summary</span>
                  </div>
                  <p className="text-muted-foreground text-[11px]">
                    Analyzes MTD revenue collected (KES 3.84M), outstanding balances (KES 620k), and Safaricom Daraja M-Pesa share (68.4%).
                  </p>
                  <span className="text-[10px] font-mono text-emerald-500">Role-gated (Finance/Admin)</span>
                </div>

                <div className="bg-card p-5 rounded-2xl border border-border shadow-card space-y-2">
                  <div className="flex items-center space-x-2 text-secondary font-semibold">
                    <Users className="w-4 h-4" />
                    <span>get_staff_workload</span>
                  </div>
                  <p className="text-muted-foreground text-[11px]">
                    Verifies 14 active clinical staff, duty rosters, and medical licensing status under KMPDC and Nursing Council of Kenya (NCK).
                  </p>
                  <span className="text-[10px] font-mono text-emerald-500">Live Roster</span>
                </div>

                <div className="bg-card p-5 rounded-2xl border border-border shadow-card space-y-2">
                  <div className="flex items-center space-x-2 text-primary font-semibold">
                    <ShieldCheck className="w-4 h-4" />
                    <span>get_institutional_protocols</span>
                  </div>
                  <p className="text-muted-foreground text-[11px]">
                    Verified institutional knowledge: CIWA-Ar alcohol scores, COWS opioid scores, and Nairobi West Hospital emergency MoUs.
                  </p>
                  <span className="text-[10px] font-mono text-emerald-500">Healthcare Protocol</span>
                </div>
              </div>

              {/* Safety & Clinical Guardrails */}
              <div className="bg-surface-subtle p-5 rounded-2xl border border-border space-y-2 text-xs">
                <div className="flex items-center space-x-2 text-warning font-semibold">
                  <AlertCircle className="w-4 h-4" />
                  <span>Clinical Safety & Regulatory Guardrails</span>
                </div>
                <p className="text-muted-foreground text-[11px] leading-relaxed">
                  Calyvia AI functions strictly as an operational and administrative copilot. It will never diagnose patients, prescribe pharmaceuticals, or modify medical treatment plans autonomously. All clinical recommendations cite verified institutional protocols and require validation by a licensed Calyvia physician.
                </p>
              </div>
            </div>
          )}

          {/* Module: 23. Reports & Analytics */}
          {activeModule === 'reports' && (
            <div className="space-y-6">
              <div className="bg-card p-6 rounded-2xl border border-border shadow-card space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-serif text-xl font-bold text-foreground">Facility Reports & Executive Analytics</h2>
                    <p className="text-xs text-muted-foreground">Ministry of Health (MoH) statistical aggregates and financial audits</p>
                  </div>
                  <button onClick={() => alert('Exporting KDPA-compliant report.')} className="px-3 py-1.5 bg-surface border border-border rounded-xl text-xs font-semibold hover:bg-surface-elevated flex items-center space-x-1">
                    <Download className="w-3.5 h-3.5" />
                    <span>Export CSV</span>
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 text-xs">
                  <div className="p-4 rounded-xl bg-surface-subtle border border-border">
                    <span className="text-muted-foreground">MTD Collections</span>
                    <div className="text-xl font-bold font-mono text-foreground mt-1">KES 3,840,000</div>
                    <span className="text-[10px] text-success">+14.2% vs target</span>
                  </div>
                  <div className="p-4 rounded-xl bg-surface-subtle border border-border">
                    <span className="text-muted-foreground">Detox Completion Rate</span>
                    <div className="text-xl font-bold font-serif text-foreground mt-1">96.4%</div>
                    <span className="text-[10px] text-primary">Clinical Outcome</span>
                  </div>
                  <div className="p-4 rounded-xl bg-surface-subtle border border-border">
                    <span className="text-muted-foreground">90-Day Sobriety Rate</span>
                    <div className="text-xl font-bold font-serif text-foreground mt-1">92.4%</div>
                    <span className="text-[10px] text-secondary">Aftercare Tracking</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Module: 24. Security & Audit Trail */}
          {activeModule === 'security' && (
            <div className="space-y-6">
              <div className="bg-card p-6 rounded-2xl border border-border shadow-card space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-serif text-xl font-bold text-foreground">Security & Immutable Audit Trail (KDPA 2019)</h2>
                    <p className="text-xs text-muted-foreground">Cryptographic logging of all EMR access events, logins, and data modifications</p>
                  </div>
                  <span className="px-3 py-1 bg-primary-soft text-primary text-xs font-bold rounded-full">
                    AES-256-GCM Active
                  </span>
                </div>
                <div className="overflow-x-auto rounded-xl border border-border mt-3">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-surface-elevated text-muted-foreground uppercase text-[10px] tracking-wider font-semibold border-b border-border">
                      <tr>
                        <th className="px-4 py-3">Timestamp</th>
                        <th className="px-4 py-3">Actor / User</th>
                        <th className="px-4 py-3">Role</th>
                        <th className="px-4 py-3">Action</th>
                        <th className="px-4 py-3">Resource</th>
                        <th className="px-4 py-3">Client IP</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      <tr className="hover:bg-surface-subtle transition-colors">
                        <td className="px-4 py-3 font-mono text-[11px]">Today @ 08:30:12</td>
                        <td className="px-4 py-3 font-semibold text-foreground">Dr. Antony Baraka</td>
                        <td className="px-4 py-3 text-secondary font-medium">SUPER_ADMIN</td>
                        <td className="px-4 py-3 font-mono text-primary font-bold">LOGIN_SUCCESS</td>
                        <td className="px-4 py-3 font-mono">AUTH_SESSION</td>
                        <td className="px-4 py-3 font-mono text-muted-foreground">127.0.0.1</td>
                      </tr>
                      <tr className="hover:bg-surface-subtle transition-colors">
                        <td className="px-4 py-3 font-mono text-[11px]">Today @ 09:00:45</td>
                        <td className="px-4 py-3 font-semibold text-foreground">Dr. Antony Baraka</td>
                        <td className="px-4 py-3 text-secondary font-medium">SUPER_ADMIN</td>
                        <td className="px-4 py-3 font-mono text-primary font-bold">SCHEDULE_APPOINTMENT</td>
                        <td className="px-4 py-3 font-mono">APPOINTMENT</td>
                        <td className="px-4 py-3 font-mono text-muted-foreground">127.0.0.1</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Module: 25. System Administration */}
          {activeModule === 'system_admin' && (
            <div className="space-y-6">
              <div className="bg-card p-6 rounded-2xl border border-border shadow-card space-y-4">
                <div>
                  <h2 className="font-serif text-xl font-bold text-foreground">Facility Master Configuration</h2>
                  <p className="text-xs text-muted-foreground">Enterprise parameters, currency, timezone, and partner emergency hospitals</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 text-xs">
                  <div className="p-4 rounded-xl bg-surface-subtle border border-border space-y-2">
                    <span className="font-semibold text-foreground">Facility Details</span>
                    <div className="space-y-1 text-muted-foreground">
                      <p><strong>Name:</strong> Calyvia Wellness Center</p>
                      <p><strong>Location:</strong> Mugutha, Ruiru, Kiambu County, Kenya</p>
                      <p><strong>Hotline:</strong> +254 700 534 306</p>
                      <p><strong>Partner Hospital:</strong> The Nairobi West Hospital (MoU Active)</p>
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-surface-subtle border border-border space-y-2">
                    <span className="font-semibold text-foreground">Regional Parameters</span>
                    <div className="space-y-1 text-muted-foreground">
                      <p><strong>Currency:</strong> KES (Kenya Shilling)</p>
                      <p><strong>Timezone:</strong> Africa/Nairobi (EAT / UTC+3)</p>
                      <p><strong>Database:</strong> Supabase PostgreSQL (aws-0-eu-west-1)</p>
                      <p><strong>Regulation:</strong> KDPA 2019 • KMPDC Registered</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Fallback for other modules */}
          {activeModule !== 'dashboard' &&
            activeModule !== 'billing' &&
            activeModule !== 'detox' &&
            activeModule !== 'ai_extension' &&
            activeModule !== 'patients' &&
            activeModule !== 'crm' &&
            activeModule !== 'appointments' &&
            activeModule !== 'clinical' &&
            activeModule !== 'pharmacy' &&
            activeModule !== 'rooms' &&
            activeModule !== 'staff' &&
            activeModule !== 'reports' &&
            activeModule !== 'security' &&
            activeModule !== 'system_admin' && (
              <div className="bg-card p-8 sm:p-12 rounded-2xl border border-border shadow-card text-center space-y-4">
                <div className="w-14 h-14 bg-primary-soft text-primary rounded-2xl flex items-center justify-center mx-auto shadow-xs">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <h2 className="font-serif text-2xl font-bold text-foreground capitalize">
                  {activeModule.replace('_', ' ')} Management View
                </h2>
                <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
                  Module actively mounted. Full operational entity controls, data tables, and REST API endpoints available at <code className="text-primary font-mono bg-surface-subtle px-1.5 py-0.5 rounded border border-border">/api/v1/{activeModule}</code>.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => setActiveModule('dashboard')}
                    className="px-4 py-2 bg-surface border border-border hover:bg-surface-elevated text-foreground text-xs font-semibold rounded-xl transition shadow-xs"
                  >
                    &larr; Return to Dashboard
                  </button>
                </div>
              </div>
            )}
        </main>
      </div>

      {/* Modal: Register Patient */}
      {activeModal === 'register_patient' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-surface border border-border rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <h3 className="font-serif text-lg font-bold text-foreground">Register New Patient</h3>
              <button onClick={() => setActiveModal(null)} className="p-1 rounded-lg text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleRegisterPatientSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-foreground font-semibold mb-1">First Name</label>
                  <input
                    type="text"
                    required
                    value={newPatient.firstName}
                    onChange={(e) => setNewPatient({ ...newPatient, firstName: e.target.value })}
                    className="w-full bg-surface-subtle border border-border rounded-xl p-2.5 text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-foreground font-semibold mb-1">Last Name</label>
                  <input
                    type="text"
                    required
                    value={newPatient.lastName}
                    onChange={(e) => setNewPatient({ ...newPatient, lastName: e.target.value })}
                    className="w-full bg-surface-subtle border border-border rounded-xl p-2.5 text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-foreground font-semibold mb-1">Phone Number (+254)</label>
                <input
                  type="text"
                  placeholder="+2547XXXXXXXX"
                  value={newPatient.phone}
                  onChange={(e) => setNewPatient({ ...newPatient, phone: e.target.value })}
                  className="w-full bg-surface-subtle border border-border rounded-xl p-2.5 text-foreground focus:outline-none focus:border-primary font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-foreground font-semibold mb-1">Gender</label>
                  <select
                    value={newPatient.gender}
                    onChange={(e) => setNewPatient({ ...newPatient, gender: e.target.value })}
                    className="w-full bg-surface-subtle border border-border rounded-xl p-2.5 text-foreground focus:outline-none"
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                  </select>
                </div>
                <div>
                  <label className="block text-foreground font-semibold mb-1">County</label>
                  <input
                    type="text"
                    value={newPatient.county}
                    onChange={(e) => setNewPatient({ ...newPatient, county: e.target.value })}
                    className="w-full bg-surface-subtle border border-border rounded-xl p-2.5 text-foreground focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 border border-border rounded-xl text-foreground font-medium hover:bg-surface-elevated"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary-hover shadow-xs"
                >
                  Register Patient
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Schedule Appointment */}
      {activeModal === 'book_appointment' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-surface border border-border rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <h3 className="font-serif text-lg font-bold text-foreground">Schedule Clinical Appointment</h3>
              <button onClick={() => setActiveModal(null)} className="p-1 rounded-lg text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleBookAppointmentSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-foreground font-semibold mb-1">Session Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CBT Relapse Prevention Review"
                  value={newAppointment.title}
                  onChange={(e) => setNewAppointment({ ...newAppointment, title: e.target.value })}
                  className="w-full bg-surface-subtle border border-border rounded-xl p-2.5 text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-foreground font-semibold mb-1">Clinician</label>
                <select
                  value={newAppointment.staffMemberName}
                  onChange={(e) => setNewAppointment({ ...newAppointment, staffMemberName: e.target.value })}
                  className="w-full bg-surface-subtle border border-border rounded-xl p-2.5 text-foreground focus:outline-none"
                >
                  <option value="Dr. Evelyn Wanjiku">Dr. Evelyn Wanjiku (Psychiatrist)</option>
                  <option value="Dr. Antony Baraka">Dr. Antony Baraka (Clinical Admin)</option>
                  <option value="Counsellor David">Counsellor David (Addiction Therapist)</option>
                  <option value="Dr. David Mwangi">Dr. David Mwangi (Medical Officer)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-foreground font-semibold mb-1">Time</label>
                  <input
                    type="text"
                    value={newAppointment.time}
                    onChange={(e) => setNewAppointment({ ...newAppointment, time: e.target.value })}
                    className="w-full bg-surface-subtle border border-border rounded-xl p-2.5 text-foreground font-mono"
                  />
                </div>
                <div>
                  <label className="block text-foreground font-semibold mb-1">Location</label>
                  <input
                    type="text"
                    value={newAppointment.location}
                    onChange={(e) => setNewAppointment({ ...newAppointment, location: e.target.value })}
                    className="w-full bg-surface-subtle border border-border rounded-xl p-2.5 text-foreground"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 border border-border rounded-xl text-foreground font-medium hover:bg-surface-elevated"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary-hover shadow-xs"
                >
                  Confirm Appointment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
