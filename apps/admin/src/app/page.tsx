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
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [activeModule, setActiveModule] = useState<string>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<number>(10);
  const [trendView, setTrendView] = useState<'weekly' | 'monthly'>('weekly');

  // M-Pesa STK Push state for billing demo
  const [stkPhoneNumber, setStkPhoneNumber] = useState<string>('254712345678');
  const [stkAmount, setStkAmount] = useState<string>('45000');
  const [stkStatus, setStkStatus] = useState<string | null>(null);

  // Dynamic Nairobi-time greeting
  const [greeting, setGreeting] = useState<{ salutation: string; message: string }>({
    salutation: 'Good morning',
    message: "Welcome back! Here's what's happening at Calyvia today.",
  });

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

  // Calendar matrix for October 2026 (Starts on Thursday)
  const calendarDays = [
    { day: null }, { day: null }, { day: null }, { day: null }, // Mon-Thu shift for Oct 1
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
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-foreground mt-2 tracking-tight">
                Dashboard
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground font-sans mt-0.5">
                {greeting.salutation}, Dr. Antony Baraka. {greeting.message}
              </p>
            </div>

            {/* Quick Action Buttons inspired by Holistic reference */}
            <div className="flex items-center space-x-2.5 self-start sm:self-auto">
              <button
                onClick={() => setActiveModule('appointments')}
                className="inline-flex items-center space-x-1.5 px-4 py-2.5 bg-primary text-primary-foreground text-xs font-semibold rounded-xl hover:bg-primary-hover hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>New Appointment</span>
              </button>
              <button
                onClick={() => setActiveModule('crm')}
                className="inline-flex items-center space-x-1.5 px-4 py-2.5 bg-surface border border-border text-foreground text-xs font-semibold rounded-xl hover:bg-surface-elevated hover:border-primary/40 hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 shadow-xs"
              >
                <UserCheck className="w-4 h-4 text-primary" />
                <span>Register Patient</span>
              </button>
            </div>
          </div>

          {/* Module: Dashboard & Management Overview */}
          {activeModule === 'dashboard' && (
            <div className="space-y-6">
              {/* 4 Metric Overview Cards (Holistic Layout) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Card 1: Total Inpatients / Census */}
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

                {/* Card 2: Appointments Today */}
                <div className="bg-card p-5 rounded-2xl border border-border shadow-card flex flex-col justify-between hover:border-border-strong hover:shadow-elevated transition-all duration-200 group">
                  <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
                    <span className="text-foreground font-semibold">Today's Appointments</span>
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

                {/* Card 3: Active Medical Detox */}
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

                {/* Card 4: MTD Revenue Collected */}
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

              {/* Main Dashboard Grid: Left Content (2 Cols) + Right Sidebar (1 Col) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left Columns (8/12): Analytics, Ward Census, Appointments & Monitoring */}
                <div className="lg:col-span-8 space-y-6">
                  {/* Chart 1: Clinical Activity & Inpatient Flow */}
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
                            trendView === 'weekly'
                              ? 'bg-surface text-foreground shadow-xs font-semibold'
                              : 'text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          Weekly
                        </button>
                        <button
                          onClick={() => setTrendView('monthly')}
                          className={`px-3 py-1 rounded-lg font-medium transition-all ${
                            trendView === 'monthly'
                              ? 'bg-surface text-foreground shadow-xs font-semibold'
                              : 'text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          Monthly
                        </button>
                      </div>
                    </div>

                    {/* SVG Vector Area & Curve Chart */}
                    <div className="relative pt-4 pb-2">
                      <div className="h-48 w-full">
                        <svg className="w-full h-full overflow-visible" viewBox="0 0 500 150" preserveAspectRatio="none">
                          <defs>
                            <linearGradient id="primaryAreaGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.25" />
                              <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.0" />
                            </linearGradient>
                            <linearGradient id="secondaryAreaGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="var(--secondary)" stopOpacity="0.2" />
                              <stop offset="100%" stopColor="var(--secondary)" stopOpacity="0.0" />
                            </linearGradient>
                          </defs>

                          {/* Horizontal Grid lines */}
                          <line x1="0" y1="30" x2="500" y2="30" stroke="var(--border)" strokeDasharray="3 3" strokeWidth="1" />
                          <line x1="0" y1="75" x2="500" y2="75" stroke="var(--border)" strokeDasharray="3 3" strokeWidth="1" />
                          <line x1="0" y1="120" x2="500" y2="120" stroke="var(--border)" strokeDasharray="3 3" strokeWidth="1" />

                          {/* Area 1: Consultations */}
                          <path
                            d="M 0 110 Q 80 40, 160 70 T 330 45 T 500 20 L 500 150 L 0 150 Z"
                            fill="url(#primaryAreaGrad)"
                          />
                          {/* Curve 1 */}
                          <path
                            d="M 0 110 Q 80 40, 160 70 T 330 45 T 500 20"
                            fill="none"
                            stroke="var(--primary)"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                          />

                          {/* Area 2: Detox Admissions */}
                          <path
                            d="M 0 130 Q 80 90, 160 100 T 330 80 T 500 65 L 500 150 L 0 150 Z"
                            fill="url(#secondaryAreaGrad)"
                          />
                          {/* Curve 2 */}
                          <path
                            d="M 0 130 Q 80 90, 160 100 T 330 80 T 500 65"
                            fill="none"
                            stroke="var(--secondary)"
                            strokeWidth="2"
                            strokeDasharray="4 2"
                            strokeLinecap="round"
                          />

                          {/* Key Data Point Markers */}
                          <circle cx="160" cy="70" r="4" fill="var(--primary)" stroke="var(--surface)" strokeWidth="2" />
                          <circle cx="330" cy="45" r="4" fill="var(--primary)" stroke="var(--surface)" strokeWidth="2" />
                          <circle cx="500" cy="20" r="5" fill="var(--primary)" stroke="var(--surface)" strokeWidth="2" />
                        </svg>
                      </div>

                      {/* X-Axis labels */}
                      <div className="flex justify-between text-[11px] text-muted-foreground pt-2 border-t border-border/40 font-mono">
                        <span>Mon</span>
                        <span>Tue</span>
                        <span>Wed</span>
                        <span>Thu</span>
                        <span>Fri</span>
                        <span>Sat</span>
                        <span>Sun</span>
                      </div>
                    </div>

                    {/* Chart Legend & Summary Stats */}
                    <div className="flex flex-wrap items-center justify-between gap-4 pt-2 text-xs">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1.5">
                          <span className="w-3 h-3 rounded-full bg-primary" />
                          <span className="text-foreground font-medium">Therapy & Consultations</span>
                        </div>
                        <div className="flex items-center space-x-1.5">
                          <span className="w-3 h-3 rounded-full bg-secondary border border-secondary" />
                          <span className="text-muted-foreground">Inpatient & Detox Admissions</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 text-[11px] text-muted-foreground">
                        <span>Avg Stay: <strong className="text-foreground">14.2 Days</strong></span>
                        <span>Detox Success: <strong className="text-foreground">96.4%</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Ward Bed Census Breakdown */}
                  <div className="bg-card p-5 sm:p-6 rounded-2xl border border-border shadow-card space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="font-serif text-lg font-bold text-foreground">
                          Inpatient Ward Census & Capacity Allocation
                        </h2>
                        <p className="text-xs text-muted-foreground">
                          Real-time occupancy across Calyvia inpatient wings
                        </p>
                      </div>
                      <button
                        onClick={() => setActiveModule('rooms')}
                        className="text-xs text-primary font-semibold hover:underline"
                      >
                        Manage Beds &rarr;
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                      {/* Ward 1 */}
                      <div className="p-3.5 rounded-xl bg-surface-subtle border border-border space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-foreground">Detox Ward</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-bold bg-accent-soft text-accent">
                            100%
                          </span>
                        </div>
                        <div className="w-full bg-border rounded-full h-1.5 overflow-hidden">
                          <div className="bg-accent h-1.5 rounded-full w-full" />
                        </div>
                        <div className="flex justify-between text-[11px] text-muted-foreground">
                          <span>6/6 Beds</span>
                          <span className="text-accent font-medium">Full Acuity</span>
                        </div>
                      </div>

                      {/* Ward 2 */}
                      <div className="p-3.5 rounded-xl bg-surface-subtle border border-border space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-foreground">Horizon Wing (Male)</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-bold bg-primary-soft text-primary">
                            87.5%
                          </span>
                        </div>
                        <div className="w-full bg-border rounded-full h-1.5 overflow-hidden">
                          <div className="bg-primary h-1.5 rounded-full w-[87.5%]" />
                        </div>
                        <div className="flex justify-between text-[11px] text-muted-foreground">
                          <span>14/16 Beds</span>
                          <span className="text-primary font-medium">2 Avail.</span>
                        </div>
                      </div>

                      {/* Ward 3 */}
                      <div className="p-3.5 rounded-xl bg-surface-subtle border border-border space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-foreground">Serenity Wing (Female)</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-bold bg-secondary-soft text-secondary">
                            75.0%
                          </span>
                        </div>
                        <div className="w-full bg-border rounded-full h-1.5 overflow-hidden">
                          <div className="bg-secondary h-1.5 rounded-full w-[75%]" />
                        </div>
                        <div className="flex justify-between text-[11px] text-muted-foreground">
                          <span>6/8 Beds</span>
                          <span className="text-secondary font-medium">2 Avail.</span>
                        </div>
                      </div>

                      {/* Ward 4 */}
                      <div className="p-3.5 rounded-xl bg-surface-subtle border border-border space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-foreground">VIP Executive Suite</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-bold bg-accent-soft text-accent">
                            100%
                          </span>
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

                  {/* Component 3: Today's Appointments & Clinical Consultations */}
                  <div className="bg-card rounded-2xl border border-border shadow-card overflow-hidden">
                    <div className="p-4 sm:p-5 bg-surface-subtle border-b border-border flex items-center justify-between">
                      <div>
                        <h2 className="font-serif text-base font-bold text-foreground">
                          Today's Appointments & Clinical Consultations
                        </h2>
                        <p className="text-[11px] text-muted-foreground">
                          Scheduled psychiatric evaluations, individual therapy, and medical reviews
                        </p>
                      </div>
                      <button
                        onClick={() => setActiveModule('appointments')}
                        className="text-xs text-primary font-semibold hover:underline"
                      >
                        View All (14) &rarr;
                      </button>
                    </div>

                    <div className="divide-y divide-border text-xs">
                      {/* Appointment Item 1 */}
                      <div className="p-4 flex items-center justify-between gap-4 hover:bg-surface-subtle/60 transition-colors">
                        <div className="flex items-center space-x-3 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-primary-soft text-primary font-bold flex items-center justify-center flex-shrink-0 shadow-xs">
                            JK
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-foreground flex items-center space-x-2">
                              <span>John Kamau</span>
                              <span className="text-[10px] font-mono text-muted-foreground">CAL-2026-0001</span>
                            </div>
                            <div className="text-[11px] text-muted-foreground flex items-center space-x-1.5 mt-0.5">
                              <span className="font-medium text-foreground">Detox Protocol CIWA Review</span>
                              <span>•</span>
                              <span>Dr. Baraka</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3 flex-shrink-0">
                          <div className="text-right">
                            <div className="font-mono text-xs font-semibold text-foreground">09:00 AM</div>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-success-soft text-success border border-success/20">
                              Confirmed
                            </span>
                          </div>
                          <button
                            onClick={() => setActiveModule('detox')}
                            className="px-3 py-1.5 bg-surface border border-border hover:bg-surface-elevated text-foreground rounded-lg font-medium text-xs transition shadow-xs"
                          >
                            Details
                          </button>
                        </div>
                      </div>

                      {/* Appointment Item 2 */}
                      <div className="p-4 flex items-center justify-between gap-4 hover:bg-surface-subtle/60 transition-colors">
                        <div className="flex items-center space-x-3 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-secondary-soft text-secondary font-bold flex items-center justify-center flex-shrink-0 shadow-xs">
                            BO
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-foreground flex items-center space-x-2">
                              <span>Brian Otieno</span>
                              <span className="text-[10px] font-mono text-muted-foreground">CAL-2026-0041</span>
                            </div>
                            <div className="text-[11px] text-muted-foreground flex items-center space-x-1.5 mt-0.5">
                              <span className="font-medium text-foreground">CBT Individual Therapy</span>
                              <span>•</span>
                              <span>Counsellor David</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3 flex-shrink-0">
                          <div className="text-right">
                            <div className="font-mono text-xs font-semibold text-foreground">11:30 AM</div>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-warning-soft text-warning border border-warning/20">
                              In Progress
                            </span>
                          </div>
                          <button
                            onClick={() => setActiveModule('counselling')}
                            className="px-3 py-1.5 bg-surface border border-border hover:bg-surface-elevated text-foreground rounded-lg font-medium text-xs transition shadow-xs"
                          >
                            Details
                          </button>
                        </div>
                      </div>

                      {/* Appointment Item 3 */}
                      <div className="p-4 flex items-center justify-between gap-4 hover:bg-surface-subtle/60 transition-colors">
                        <div className="flex items-center space-x-3 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-info-soft text-info font-bold flex items-center justify-center flex-shrink-0 shadow-xs">
                            FW
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-foreground flex items-center space-x-2">
                              <span>Faith Wanjiku</span>
                              <span className="text-[10px] font-mono text-muted-foreground">CAL-2026-0052</span>
                            </div>
                            <div className="text-[11px] text-muted-foreground flex items-center space-x-1.5 mt-0.5">
                              <span className="font-medium text-foreground">Sedative Taper Chart Review</span>
                              <span>•</span>
                              <span>Dr. Mwangi</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3 flex-shrink-0">
                          <div className="text-right">
                            <div className="font-mono text-xs font-semibold text-foreground">02:00 PM</div>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-muted text-muted-foreground border border-border">
                              Waiting
                            </span>
                          </div>
                          <button
                            onClick={() => setActiveModule('clinical')}
                            className="px-3 py-1.5 bg-surface border border-border hover:bg-surface-elevated text-foreground rounded-lg font-medium text-xs transition shadow-xs"
                          >
                            Details
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Component 4: Active Inpatient & Detox Monitoring Board */}
                  <div className="bg-card rounded-2xl border border-border shadow-card overflow-hidden">
                    <div className="p-4 sm:p-5 bg-surface-subtle border-b border-border flex items-center justify-between">
                      <div>
                        <h2 className="font-serif text-base font-bold text-foreground">
                          Active Inpatient & Detox Monitoring Board
                        </h2>
                        <p className="text-[11px] text-muted-foreground">
                          Withdrawal scores (CIWA-Ar / COWS), vitals, and next scheduled e-MAR dose
                        </p>
                      </div>
                      <button
                        onClick={() => setActiveModule('detox')}
                        className="text-xs text-primary font-semibold hover:underline"
                      >
                        All Charts &rarr;
                      </button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-surface-elevated text-muted-foreground uppercase text-[10px] tracking-wider font-semibold border-b border-border">
                          <tr>
                            <th className="px-4 py-2.5">Patient & Bed</th>
                            <th className="px-4 py-2.5">Protocol</th>
                            <th className="px-4 py-2.5">Score</th>
                            <th className="px-4 py-2.5">Vitals</th>
                            <th className="px-4 py-2.5">Next MAR</th>
                            <th className="px-4 py-2.5">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          <tr className="hover:bg-surface-subtle/80 transition-colors">
                            <td className="px-4 py-3">
                              <div className="font-semibold text-foreground">John Kamau</div>
                              <div className="text-[10px] text-muted-foreground">Detox Ward • Bed 02</div>
                            </td>
                            <td className="px-4 py-3">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-danger-soft text-danger border border-danger/20">
                                Alcohol CIWA
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="font-bold text-danger">CIWA: 18</div>
                              <div className="text-[10px] text-muted-foreground">Moderate Tremors</div>
                            </td>
                            <td className="px-4 py-3 font-mono text-[11px]">
                              <div>BP: 138/88</div>
                              <div className="text-muted-foreground">HR: 94 bpm</div>
                            </td>
                            <td className="px-4 py-3">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-warning-soft text-warning border border-warning/20">
                                Diazepam 10mg @ 14:00
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <button
                                onClick={() => setActiveModule('detox')}
                                className="px-2.5 py-1 bg-primary text-primary-foreground rounded-lg text-[11px] font-semibold hover:bg-primary-hover active:scale-[0.98] transition shadow-xs"
                              >
                                Vitals
                              </button>
                            </td>
                          </tr>

                          <tr className="hover:bg-surface-subtle/80 transition-colors">
                            <td className="px-4 py-3">
                              <div className="font-semibold text-foreground">Brian Otieno</div>
                              <div className="text-[10px] text-muted-foreground">Horizon • Bed 05</div>
                            </td>
                            <td className="px-4 py-3">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-secondary-soft text-secondary border border-secondary/20">
                                Rehab Day 18
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="font-bold text-success">Complete</div>
                              <div className="text-[10px] text-muted-foreground">Phase II Stable</div>
                            </td>
                            <td className="px-4 py-3 font-mono text-[11px]">
                              <div>BP: 118/76</div>
                              <div className="text-muted-foreground">HR: 72 bpm</div>
                            </td>
                            <td className="px-4 py-3">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-success-soft text-success border border-success/20">
                                Multivitamins
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <button
                                onClick={() => setActiveModule('counselling')}
                                className="px-2.5 py-1 bg-surface border border-border text-foreground rounded-lg text-[11px] font-semibold hover:bg-surface-elevated transition shadow-xs"
                              >
                                Session
                              </button>
                            </td>
                          </tr>

                          <tr className="hover:bg-surface-subtle/80 transition-colors">
                            <td className="px-4 py-3">
                              <div className="font-semibold text-foreground">Faith Wanjiku</div>
                              <div className="text-[10px] text-muted-foreground">Serenity • Bed 03</div>
                            </td>
                            <td className="px-4 py-3">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-info-soft text-info border border-info/20">
                                Sedative Taper
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="font-bold text-info">Day 4 Taper</div>
                              <div className="text-[10px] text-muted-foreground">Mild anxiety</div>
                            </td>
                            <td className="px-4 py-3 font-mono text-[11px]">
                              <div>BP: 124/82</div>
                              <div className="text-muted-foreground">HR: 80 bpm</div>
                            </td>
                            <td className="px-4 py-3">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-info-soft text-info border border-info/20">
                                Lorazepam Taper
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <button
                                onClick={() => setActiveModule('clinical')}
                                className="px-2.5 py-1 bg-surface border border-border text-foreground rounded-lg text-[11px] font-semibold hover:bg-surface-elevated transition shadow-xs"
                              >
                                Review
                              </button>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Right Column (4/12): Mini Calendar, Today's Schedule & Facility Quick Status */}
                <div className="lg:col-span-4 space-y-6">
                  {/* Widget 1: Interactive Mini Calendar (Holistic Reference) */}
                  <div className="bg-card p-5 rounded-2xl border border-border shadow-card space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <CalendarIcon className="w-4 h-4 text-primary" />
                        <h3 className="font-serif text-base font-bold text-foreground">October 2026</h3>
                      </div>
                      <div className="flex items-center space-x-1">
                        <button
                          className="p-1.5 rounded-lg border border-border hover:bg-surface-elevated text-muted-foreground hover:text-foreground transition"
                          aria-label="Previous month"
                        >
                          <ChevronLeft className="w-3.5 h-3.5" />
                        </button>
                        <button
                          className="p-1.5 rounded-lg border border-border hover:bg-surface-elevated text-muted-foreground hover:text-foreground transition"
                          aria-label="Next month"
                        >
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Calendar Day Header */}
                    <div className="grid grid-cols-7 text-center text-[11px] font-semibold text-muted-foreground">
                      <span>Su</span>
                      <span>Mo</span>
                      <span>Tu</span>
                      <span>We</span>
                      <span>Th</span>
                      <span>Fr</span>
                      <span>Sa</span>
                    </div>

                    {/* Calendar Days Matrix */}
                    <div className="grid grid-cols-7 gap-1 text-center text-xs">
                      {calendarDays.map((item, index) => {
                        if (!item.day) {
                          return <div key={`empty-${index}`} className="h-8" />;
                        }
                        const isSelected = selectedCalendarDate === item.day;
                        return (
                          <button
                            key={`day-${item.day}`}
                            onClick={() => setSelectedCalendarDate(item.day)}
                            className={`h-8 w-8 mx-auto rounded-xl flex flex-col items-center justify-center relative transition-all ${
                              isSelected
                                ? 'bg-primary text-primary-foreground font-bold shadow-xs'
                                : 'text-foreground hover:bg-surface-subtle'
                            }`}
                          >
                            <span>{item.day}</span>
                            {item.hasEvent && !isSelected && (
                              <span className="w-1 h-1 rounded-full bg-primary absolute bottom-1" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Widget 2: Today's Clinical Schedule & Agenda (Holistic Reference) */}
                  <div className="bg-card p-5 rounded-2xl border border-border shadow-card space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-serif text-base font-bold text-foreground">Today's Schedule</h3>
                        <p className="text-[11px] text-muted-foreground">Saturday, 10 Oct 2026</p>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary-soft text-primary">
                        4 Sessions
                      </span>
                    </div>

                    <div className="space-y-3.5 text-xs">
                      {/* Timeline Item 1 */}
                      <div className="p-3.5 rounded-xl bg-surface-subtle border border-border flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <span className="text-[10px] font-mono text-muted-foreground font-semibold">
                            08:30 - 09:15 EAT
                          </span>
                          <h4 className="font-semibold text-foreground text-xs leading-snug">
                            Morning MDT Handover
                          </h4>
                          <p className="text-[11px] text-muted-foreground">Detox & Inpatient Nurse Handover</p>
                          <div className="flex items-center space-x-1.5 pt-1.5">
                            <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-[9px] flex items-center justify-center font-bold">
                              DB
                            </span>
                            <span className="w-5 h-5 rounded-full bg-secondary text-secondary-foreground text-[9px] flex items-center justify-center font-bold">
                              NW
                            </span>
                            <span className="w-5 h-5 rounded-full bg-accent text-accent-foreground text-[9px] flex items-center justify-center font-bold">
                              CD
                            </span>
                          </div>
                        </div>
                        <span className="w-6 h-6 rounded-full bg-success-soft text-success border border-success/30 flex items-center justify-center flex-shrink-0">
                          <Check className="w-3.5 h-3.5" />
                        </span>
                      </div>

                      {/* Timeline Item 2 */}
                      <div className="p-3.5 rounded-xl bg-surface-subtle border border-border flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <span className="text-[10px] font-mono text-warning font-semibold">
                            10:15 - 11:00 EAT
                          </span>
                          <h4 className="font-semibold text-foreground text-xs leading-snug">
                            Detox CIWA Vitals Check
                          </h4>
                          <p className="text-[11px] text-muted-foreground">Bed 02 & Bed 04 Medication Timing</p>
                          <div className="flex items-center space-x-1.5 pt-1.5">
                            <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-[9px] flex items-center justify-center font-bold">
                              DB
                            </span>
                            <span className="w-5 h-5 rounded-full bg-secondary text-secondary-foreground text-[9px] flex items-center justify-center font-bold">
                              NW
                            </span>
                          </div>
                        </div>
                        <span className="w-2.5 h-2.5 rounded-full bg-warning animate-ping mt-1 flex-shrink-0" />
                      </div>

                      {/* Timeline Item 3 */}
                      <div className="p-3.5 rounded-xl bg-surface-subtle border border-border flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <span className="text-[10px] font-mono text-muted-foreground font-semibold">
                            14:00 - 15:30 EAT
                          </span>
                          <h4 className="font-semibold text-foreground text-xs leading-snug">
                            Group Psychoeducation
                          </h4>
                          <p className="text-[11px] text-muted-foreground">Relapse Prevention & Triggers</p>
                          <div className="flex items-center space-x-1.5 pt-1.5">
                            <span className="w-5 h-5 rounded-full bg-accent text-accent-foreground text-[9px] flex items-center justify-center font-bold">
                              CD
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => setActiveModule('counselling')}
                          className="text-[11px] text-primary font-semibold hover:underline"
                        >
                          Join
                        </button>
                      </div>

                      {/* Timeline Item 4 */}
                      <div className="p-3.5 rounded-xl bg-surface-subtle border border-border flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <span className="text-[10px] font-mono text-muted-foreground font-semibold">
                            16:30 - 17:15 EAT
                          </span>
                          <h4 className="font-semibold text-foreground text-xs leading-snug">
                            Family Support Conference
                          </h4>
                          <p className="text-[11px] text-muted-foreground">Reintegration planning for Kamau family</p>
                          <div className="flex items-center space-x-1.5 pt-1.5">
                            <span className="w-5 h-5 rounded-full bg-secondary text-secondary-foreground text-[9px] flex items-center justify-center font-bold">
                              DN
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => setActiveModule('family')}
                          className="text-[11px] text-primary font-semibold hover:underline"
                        >
                          Files
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Widget 3: Quick Operations, Staff on Duty & Ambulance MoU */}
                  <div className="bg-card p-5 rounded-2xl border border-border shadow-card space-y-3.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground">Facility Operations</span>
                      <span className="text-[10px] font-mono text-emerald-500 font-bold">All Nominal</span>
                    </div>

                    <div className="space-y-2">
                      <div className="p-2.5 rounded-xl bg-surface-subtle border border-border flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Users className="w-4 h-4 text-primary" />
                          <span className="text-foreground">Clinical Staff on Duty</span>
                        </div>
                        <span className="font-bold font-mono text-foreground">14 Active</span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-surface-subtle border border-border flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Pill className="w-4 h-4 text-secondary" />
                          <span className="text-foreground">Pharmacy In-Stock</span>
                        </div>
                        <span className="font-bold font-mono text-emerald-500">98.2%</span>
                      </div>
                    </div>

                    {/* Hospital & Emergency Standby */}
                    <div className="pt-2 border-t border-border flex items-center justify-between text-[11px]">
                      <div className="flex items-center space-x-1.5 text-muted-foreground">
                        <PhoneCall className="w-3.5 h-3.5 text-primary" />
                        <span>Nairobi West Transfer MoU</span>
                      </div>
                      <span className="text-success font-semibold">Active</span>
                    </div>
                  </div>
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
                    Inspects today's clinical consultations, MDT reviews, therapy schedules, and clinician assignments.
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

          {/* Fallback for other modules */}
          {activeModule !== 'dashboard' && activeModule !== 'billing' && activeModule !== 'detox' && activeModule !== 'ai_extension' && (
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
    </div>
  );
}
