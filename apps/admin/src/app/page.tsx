'use client';

import React, { useState } from 'react';
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
  Calendar,
  AlertCircle
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [activeModule, setActiveModule] = useState<string>('dashboard');
  const [stkPhoneNumber, setStkPhoneNumber] = useState<string>('254712345678');
  const [stkAmount, setStkAmount] = useState<string>('45000');
  const [stkStatus, setStkStatus] = useState<string | null>(null);

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

  return (
    <div className="flex h-screen bg-background overflow-hidden text-foreground transition-colors duration-200">
      {/* Sidebar navigation */}
      <Sidebar currentModule={activeModule} onSelectModule={setActiveModule} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Executive Overview Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border">
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-primary text-primary-foreground font-mono shadow-xs">
                  FACILITY STATUS: OPERATIONAL
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-primary-soft text-primary border border-primary/20">
                  Ruiru, Kiambu County
                </span>
              </div>
              <h1 className="font-serif text-2xl font-bold text-foreground mt-2">
                Calyvia Wellness Center Management Portal
              </h1>
              <p className="text-xs text-muted-foreground font-sans">
                Comprehensive Addiction Recovery & Mental Health Clinical System (KDPA 2019 Compliant)
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center space-x-2.5">
              <button
                onClick={() => setActiveModule('crm')}
                className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-xl hover:bg-primary-hover hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Patient Intake</span>
              </button>
              <button
                onClick={() => setActiveModule('billing')}
                className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-surface border border-border text-foreground text-xs font-semibold rounded-xl hover:bg-surface-elevated hover:border-primary/40 hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 shadow-xs"
              >
                <CreditCard className="w-3.5 h-3.5 text-secondary" />
                <span>M-Pesa STK Push</span>
              </button>
            </div>
          </div>

          {/* Module: Dashboard & Management Overview */}
          {activeModule === 'dashboard' && (
            <div className="space-y-6">
              {/* Metric Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-card p-4 rounded-xl border border-border shadow-card flex flex-col justify-between hover:border-border-strong transition-all duration-200">
                  <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
                    <span>Inpatient Bed Census</span>
                    <BedDouble className="w-4 h-4 text-primary" />
                  </div>
                  <div className="mt-2">
                    <span className="text-2xl font-bold font-serif text-foreground">28</span>
                    <span className="text-xs text-muted-foreground font-sans ml-1.5">/ 32 Beds (87.5%)</span>
                  </div>
                  <div className="mt-2 text-[11px] text-secondary flex items-center font-medium">
                    <ArrowUpRight className="w-3 h-3 mr-0.5" />
                    <span>4 Beds Available (2 Male, 2 Female)</span>
                  </div>
                </div>

                <div className="bg-card p-4 rounded-xl border border-border shadow-card flex flex-col justify-between hover:border-border-strong transition-all duration-200">
                  <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
                    <span>Active Medical Detox</span>
                    <Activity className="w-4 h-4 text-accent" />
                  </div>
                  <div className="mt-2">
                    <span className="text-2xl font-bold font-serif text-accent">6</span>
                    <span className="text-xs text-muted-foreground font-sans ml-1.5">Patients on CIWA/COWS</span>
                  </div>
                  <div className="mt-2 text-[11px] text-accent flex items-center font-medium">
                    <AlertCircle className="w-3 h-3 mr-0.5" />
                    <span>2 Due for Vitals Re-check (&lt; 30m)</span>
                  </div>
                </div>

                <div className="bg-card p-4 rounded-xl border border-border shadow-card flex flex-col justify-between hover:border-border-strong transition-all duration-200">
                  <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
                    <span>Therapy Sessions Today</span>
                    <HeartHandshake className="w-4 h-4 text-secondary" />
                  </div>
                  <div className="mt-2">
                    <span className="text-2xl font-bold font-serif text-foreground">14</span>
                    <span className="text-xs text-muted-foreground font-sans ml-1.5">Sessions Scheduled</span>
                  </div>
                  <div className="mt-2 text-[11px] text-secondary flex items-center font-medium">
                    <CheckCircle2 className="w-3 h-3 mr-0.5" />
                    <span>8 Completed • 6 Pending Afternoon</span>
                  </div>
                </div>

                <div className="bg-card p-4 rounded-xl border border-border shadow-card flex flex-col justify-between hover:border-border-strong transition-all duration-200">
                  <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
                    <span>MTD Revenue Collected</span>
                    <CreditCard className="w-4 h-4 text-primary" />
                  </div>
                  <div className="mt-2">
                    <span className="text-xl font-bold font-mono text-foreground">KES 3,840,000</span>
                  </div>
                  <div className="mt-2 text-[11px] text-secondary flex items-center font-medium">
                    <span>M-Pesa Daraja: 68% • Bank: 32%</span>
                  </div>
                </div>
              </div>

              {/* Inpatients Vitals & Detox Monitoring Board */}
              <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
                <div className="p-4 bg-surface-subtle border-b border-border flex items-center justify-between">
                  <div>
                    <h2 className="font-serif text-base font-bold text-foreground">
                      Active Inpatient & Detox Withdrawal Monitoring Board
                    </h2>
                    <p className="text-[11px] text-muted-foreground">
                      Real-time clinical vitals, CIWA-Ar (Alcohol) & COWS (Opioids) scores in Ruiru Inpatient Wards
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveModule('detox')}
                    className="text-xs text-primary font-medium hover:underline flex items-center"
                  >
                    View All Detox Charts &rarr;
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-surface-elevated text-muted-foreground uppercase text-[10px] tracking-wider font-semibold border-b border-border">
                      <tr>
                        <th className="px-4 py-2.5">Patient ID & Name</th>
                        <th className="px-4 py-2.5">Ward & Bed</th>
                        <th className="px-4 py-2.5">Protocol</th>
                        <th className="px-4 py-2.5">Withdrawal Score</th>
                        <th className="px-4 py-2.5">Latest Vitals</th>
                        <th className="px-4 py-2.5">Next MAR Due</th>
                        <th className="px-4 py-2.5">MDT Lead</th>
                        <th className="px-4 py-2.5">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      <tr className="hover:bg-surface-subtle/80 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-semibold text-foreground">John Kamau</div>
                          <div className="text-[10px] text-muted-foreground font-mono">CAL-2026-0001 • Age 34</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-medium text-foreground">Detox Ward</span>
                          <div className="text-[10px] text-muted-foreground">Bed 02 (Ground)</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-danger-soft text-danger border border-danger/20">
                            Alcohol CIWA-Ar
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-bold text-danger">CIWA: 18 (Moderate)</div>
                          <div className="text-[10px] text-muted-foreground">Tremors + Nausea</div>
                        </td>
                        <td className="px-4 py-3 font-mono text-[11px]">
                          <div>BP: 138/88 mmHg</div>
                          <div className="text-muted-foreground">HR: 94 bpm • SpO2: 98%</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-warning-soft text-warning border border-warning/20">
                            Diazepam 10mg @ 14:00
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-foreground">Dr. Baraka</div>
                          <div className="text-[10px] text-muted-foreground">Nurse Wangari</div>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => setActiveModule('detox')}
                            className="px-2.5 py-1 bg-primary text-primary-foreground rounded-lg text-[11px] font-medium hover:bg-primary-hover active:scale-[0.98] transition shadow-xs"
                          >
                            Update Vitals
                          </button>
                        </td>
                      </tr>

                      <tr className="hover:bg-surface-subtle/80 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-semibold text-foreground">Brian Otieno</div>
                          <div className="text-[10px] text-muted-foreground font-mono">CAL-2026-0041 • Age 28</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-medium text-foreground">Horizon Wing</span>
                          <div className="text-[10px] text-muted-foreground">Bed 05 (Male Inpatient)</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-secondary-soft text-secondary border border-secondary/20">
                            Rehab (Day 18/30)
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-bold text-success">Detox Complete</div>
                          <div className="text-[10px] text-muted-foreground">Stable in Phase II</div>
                        </td>
                        <td className="px-4 py-3 font-mono text-[11px]">
                          <div>BP: 118/76 mmHg</div>
                          <div className="text-muted-foreground">HR: 72 bpm • SpO2: 99%</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-success-soft text-success border border-success/20">
                            Multivitamin Tabs
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-foreground">Dr. Nduta</div>
                          <div className="text-[10px] text-muted-foreground">Counsellor David</div>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => setActiveModule('counselling')}
                            className="px-2.5 py-1 bg-surface border border-border text-foreground rounded-lg text-[11px] font-medium hover:bg-surface-elevated transition shadow-xs"
                          >
                            Session Note
                          </button>
                        </td>
                      </tr>

                      <tr className="hover:bg-surface-subtle/80 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-semibold text-foreground">Faith Wanjiku</div>
                          <div className="text-[10px] text-muted-foreground font-mono">CAL-2026-0052 • Age 41</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-medium text-foreground">Serenity Wing</span>
                          <div className="text-[10px] text-muted-foreground">Bed 03 (Female Inpatient)</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-info-soft text-info border border-info/20">
                            Prescription Sedatives
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-bold text-info">Taper Day 4</div>
                          <div className="text-[10px] text-muted-foreground">Mild anxiety / alert</div>
                        </td>
                        <td className="px-4 py-3 font-mono text-[11px]">
                          <div>BP: 124/82 mmHg</div>
                          <div className="text-muted-foreground">HR: 80 bpm • SpO2: 98%</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-info-soft text-info border border-info/20">
                            Lorazepam Taper
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-foreground">Dr. Mwangi</div>
                          <div className="text-[10px] text-muted-foreground">Nurse Beatrice</div>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => setActiveModule('clinical')}
                            className="px-2.5 py-1 bg-surface border border-border text-foreground rounded-lg text-[11px] font-medium hover:bg-surface-elevated transition shadow-xs"
                          >
                            Chart Review
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Module: 07. Billing & Daraja M-Pesa Integration Demo */}
          {activeModule === 'billing' && (
            <div className="bg-card p-6 rounded-xl border border-border shadow-card space-y-6">
              <div>
                <h2 className="font-serif text-lg font-bold text-foreground">
                  Module 07: Billing & Safaricom Daraja M-Pesa STK Push
                </h2>
                <p className="text-xs text-muted-foreground">
                  Collect rehab deposits, consultation fees, and pharmacy disbursements directly to Calyvia Till / Paybill
                </p>
              </div>

              <div className="max-w-md bg-surface-subtle p-5 rounded-xl border border-border space-y-4 text-xs">
                <div className="space-y-3">
                  <div>
                    <label className="block text-foreground font-semibold mb-1">
                      Patient Safaricom Phone Number
                    </label>
                    <input
                      type="text"
                      value={stkPhoneNumber}
                      onChange={(e) => setStkPhoneNumber(e.target.value)}
                      className="w-full bg-surface border border-border rounded-lg p-2.5 font-mono text-xs text-foreground focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-foreground font-semibold mb-1">
                      Billing Amount in Kenya Shillings (KES)
                    </label>
                    <input
                      type="number"
                      value={stkAmount}
                      onChange={(e) => setStkAmount(e.target.value)}
                      className="w-full bg-surface border border-border rounded-lg p-2.5 font-mono text-xs text-foreground focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none transition-colors"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={handleTriggerMpesaStk}
                      className="w-full py-2.5 bg-primary hover:bg-primary-hover active:scale-[0.98] text-primary-foreground font-semibold rounded-xl text-xs transition-all duration-200 shadow-xs flex items-center justify-center space-x-2"
                    >
                      <Smartphone className="w-4 h-4" />
                      <span>Send M-Pesa Prompt (KES {Number(stkAmount).toLocaleString()})</span>
                    </button>
                  </div>

                  {stkStatus && (
                    <div className="mt-4 p-3 rounded-lg border border-border text-xs font-mono">
                      {stkStatus === 'REQUESTED' && (
                        <div className="text-warning bg-warning-soft border border-warning/20 p-2.5 rounded-lg">
                          Handshaking with Safaricom Daraja API gateway...
                        </div>
                      )}
                      {stkStatus === 'SENT_TO_PHONE' && (
                        <div className="text-info bg-info-soft border border-info/20 p-2.5 rounded-lg animate-pulse">
                          STK Push prompt sent to {stkPhoneNumber}. Awaiting PIN entry...
                        </div>
                      )}
                      {stkStatus === 'SUCCESS' && (
                        <div className="text-success bg-success-soft border border-success/30 p-3 rounded-lg">
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
            <div className="bg-card p-6 rounded-xl border border-border shadow-card space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-serif text-lg font-bold text-foreground">
                    Clinical Detoxification Assessment & Protocol Calculator
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Clinical Institute Withdrawal Assessment for Alcohol (CIWA-Ar) & Clinical Opiate Withdrawal Scale (COWS)
                  </p>
                </div>
                <span className="px-3 py-1 bg-accent-soft text-accent text-xs font-bold rounded-full border border-accent/20">
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

          {/* Fallback for other modules */}
          {activeModule !== 'dashboard' && activeModule !== 'billing' && activeModule !== 'detox' && (
            <div className="bg-card p-8 rounded-xl border border-border shadow-card text-center space-y-3">
              <div className="w-12 h-12 bg-primary-soft text-primary rounded-full flex items-center justify-center mx-auto shadow-xs">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h2 className="font-serif text-xl font-bold text-foreground capitalize">
                {activeModule.replace('_', ' ')} Management View
              </h2>
              <p className="text-xs text-muted-foreground max-w-md mx-auto">
                Module actively mounted. Full operational entity controls, data tables, and REST API endpoints available at <code className="text-primary font-mono bg-surface-subtle px-1.5 py-0.5 rounded border border-border">/api/v1/{activeModule}</code>.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
