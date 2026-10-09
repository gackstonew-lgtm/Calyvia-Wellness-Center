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
    <div className="flex h-screen bg-sand-50 overflow-hidden text-calyvia-dark">
      {/* Sidebar navigation */}
      <Sidebar currentModule={activeModule} onSelectModule={setActiveModule} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Executive Overview Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-sand-200">
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-forest-800 text-white font-mono">
                  FACILITY STATUS: OPERATIONAL
                </span>
                <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-sage-100 text-forest-800">
                  Ruiru, Kiambu County
                </span>
              </div>
              <h1 className="font-serif text-2xl font-bold text-forest-900 mt-1">
                Calyvia Wellness Center Management Portal
              </h1>
              <p className="text-xs text-calyvia-muted font-sans">
                Comprehensive Addiction Recovery & Mental Health Clinical System (KDPA 2019 Compliant)
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center space-x-2.5">
              <button
                onClick={() => setActiveModule('crm')}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-forest-800 text-white text-xs font-medium rounded-md hover:bg-forest-700 transition shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Patient Intake</span>
              </button>
              <button
                onClick={() => setActiveModule('billing')}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white border border-sand-300 text-calyvia-dark text-xs font-medium rounded-md hover:bg-sand-100 transition shadow-sm"
              >
                <CreditCard className="w-3.5 h-3.5 text-sage-500" />
                <span>M-Pesa STK Push</span>
              </button>
            </div>
          </div>

          {/* Module: Dashboard & Management Overview */}
          {activeModule === 'dashboard' && (
            <div className="space-y-6">
              {/* Metric Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg border border-sand-200 shadow-sm flex flex-col justify-between">
                  <div className="flex items-center justify-between text-calyvia-muted text-xs font-medium">
                    <span>Inpatient Bed Census</span>
                    <BedDouble className="w-4 h-4 text-forest-800" />
                  </div>
                  <div className="mt-2">
                    <span className="text-2xl font-bold font-serif text-forest-900">28</span>
                    <span className="text-xs text-calyvia-muted font-sans ml-1.5">/ 32 Beds (87.5%)</span>
                  </div>
                  <div className="mt-2 text-[11px] text-sage-500 flex items-center">
                    <ArrowUpRight className="w-3 h-3 mr-0.5" />
                    <span>4 Beds Available (2 Male, 2 Female)</span>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-lg border border-sand-200 shadow-sm flex flex-col justify-between">
                  <div className="flex items-center justify-between text-calyvia-muted text-xs font-medium">
                    <span>Active Medical Detox</span>
                    <Activity className="w-4 h-4 text-terracotta-500" />
                  </div>
                  <div className="mt-2">
                    <span className="text-2xl font-bold font-serif text-terracotta-500">6</span>
                    <span className="text-xs text-calyvia-muted font-sans ml-1.5">Patients on CIWA/COWS</span>
                  </div>
                  <div className="mt-2 text-[11px] text-terracotta-600 flex items-center font-medium">
                    <AlertCircle className="w-3 h-3 mr-0.5" />
                    <span>2 Due for Vitals Re-check (&lt; 30m)</span>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-lg border border-sand-200 shadow-sm flex flex-col justify-between">
                  <div className="flex items-center justify-between text-calyvia-muted text-xs font-medium">
                    <span>Therapy Sessions Today</span>
                    <HeartHandshake className="w-4 h-4 text-sage-500" />
                  </div>
                  <div className="mt-2">
                    <span className="text-2xl font-bold font-serif text-forest-900">14</span>
                    <span className="text-xs text-calyvia-muted font-sans ml-1.5">Sessions Scheduled</span>
                  </div>
                  <div className="mt-2 text-[11px] text-sage-500 flex items-center">
                    <CheckCircle2 className="w-3 h-3 mr-0.5" />
                    <span>8 Completed • 6 Pending Afternoon</span>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-lg border border-sand-200 shadow-sm flex flex-col justify-between">
                  <div className="flex items-center justify-between text-calyvia-muted text-xs font-medium">
                    <span>MTD Revenue Collected</span>
                    <CreditCard className="w-4 h-4 text-forest-800" />
                  </div>
                  <div className="mt-2">
                    <span className="text-xl font-bold font-mono text-forest-900">KES 3,840,000</span>
                  </div>
                  <div className="mt-2 text-[11px] text-sage-500 flex items-center font-medium">
                    <span>M-Pesa Daraja: 68% • Bank: 32%</span>
                  </div>
                </div>
              </div>

              {/* Inpatients Vitals & Detox Monitoring Board */}
              <div className="bg-white rounded-lg border border-sand-200 shadow-sm overflow-hidden">
                <div className="p-4 bg-sand-50/70 border-b border-sand-200 flex items-center justify-between">
                  <div>
                    <h2 className="font-serif text-base font-bold text-forest-900">
                      Active Inpatient & Detox Withdrawal Monitoring Board
                    </h2>
                    <p className="text-[11px] text-calyvia-muted">
                      Real-time clinical vitals, CIWA-Ar (Alcohol) & COWS (Opioids) scores in Ruiru Inpatient Wards
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveModule('detox')}
                    className="text-xs text-forest-800 font-medium hover:underline flex items-center"
                  >
                    View All Detox Charts &rarr;
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-sand-100 text-calyvia-muted uppercase text-[10px] tracking-wider font-semibold">
                      <tr>
                        <th className="px-4 py-2.5">Patient ID & Name</th>
                        <th className="px-4 py-2.5">Ward & Bed</th>
                        <th className="px-4 py-2.5">Protocol</th>
                        <th className="px-4 py-2.5">Withdrawal Score</th>
                        <th className="px-4 py-2.5">Latest Vitals</th>
                        <th className="px-4 py-2.5">Next MAR Due</th>
                        <th className="px-4 py-2.5">Attending Staff</th>
                        <th className="px-4 py-2.5">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-sand-200 font-sans">
                      <tr className="hover:bg-sand-50/80 transition">
                        <td className="px-4 py-3">
                          <div className="font-semibold text-calyvia-dark">James Mwangi</div>
                          <div className="text-[10px] text-calyvia-muted font-mono">CAL-2026-0038 • Age 34</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-medium text-forest-800">Detox Ward</span>
                          <div className="text-[10px] text-calyvia-muted">Bed 02 (Ground)</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-terracotta-100 text-terracotta-600 border border-terracotta-500/20">
                            Alcohol CIWA-Ar
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-bold text-terracotta-600">CIWA: 18 (Moderate)</div>
                          <div className="text-[10px] text-calyvia-muted">Tremors + Nausea</div>
                        </td>
                        <td className="px-4 py-3 font-mono text-[11px]">
                          <div>BP: 138/88 mmHg</div>
                          <div className="text-calyvia-muted">HR: 94 bpm • SpO2: 98%</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                            Diazepam 10mg @ 14:00
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div>Dr. Baraka</div>
                          <div className="text-[10px] text-calyvia-muted">Nurse Wangari</div>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => setActiveModule('detox')}
                            className="px-2.5 py-1 bg-forest-800 text-white rounded text-[11px] hover:bg-forest-700 transition"
                          >
                            Update Vitals
                          </button>
                        </td>
                      </tr>

                      <tr className="hover:bg-sand-50/80 transition">
                        <td className="px-4 py-3">
                          <div className="font-semibold text-calyvia-dark">Brian Otieno</div>
                          <div className="text-[10px] text-calyvia-muted font-mono">CAL-2026-0041 • Age 28</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-medium text-forest-800">Horizon Wing</span>
                          <div className="text-[10px] text-calyvia-muted">Bed 05 (Male Inpatient)</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-sage-100 text-forest-800 border border-sage-200">
                            Rehab (Day 18/30)
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-bold text-sage-600">Detox Complete</div>
                          <div className="text-[10px] text-calyvia-muted">Stable in Phase II</div>
                        </td>
                        <td className="px-4 py-3 font-mono text-[11px]">
                          <div>BP: 118/76 mmHg</div>
                          <div className="text-calyvia-muted">HR: 72 bpm • SpO2: 99%</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Multivitamins OD
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div>Counsellor Kioko</div>
                          <div className="text-[10px] text-calyvia-muted">Nurse Njoroge</div>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => setActiveModule('counselling')}
                            className="px-2.5 py-1 bg-white border border-sand-300 text-forest-800 rounded text-[11px] hover:bg-sand-100 transition"
                          >
                            Therapy Note
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Module: 07. Billing & Daraja M-Pesa STK Push */}
          {activeModule === 'billing' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg border border-sand-200 shadow-sm max-w-2xl">
                <div className="flex items-center space-x-2 text-forest-800 font-serif text-lg font-bold">
                  <Smartphone className="w-5 h-5 text-emerald-600" />
                  <h2>Safaricom Daraja M-Pesa STK Push Payment Terminal</h2>
                </div>
                <p className="text-xs text-calyvia-muted mt-1">
                  Initiate prompt directly to patient or guardian phone number for instant admission fee settlement.
                </p>

                <div className="mt-4 space-y-3 font-sans text-xs">
                  <div>
                    <label className="block text-calyvia-dark font-medium mb-1">
                      Phone Number (Safaricom M-Pesa E.164)
                    </label>
                    <input
                      type="text"
                      value={stkPhoneNumber}
                      onChange={(e) => setStkPhoneNumber(e.target.value)}
                      className="w-full border border-sand-300 rounded p-2 font-mono text-xs focus:ring-1 focus:ring-forest-800 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-calyvia-dark font-medium mb-1">
                      Billing Amount in Kenya Shillings (KES)
                    </label>
                    <input
                      type="number"
                      value={stkAmount}
                      onChange={(e) => setStkAmount(e.target.value)}
                      className="w-full border border-sand-300 rounded p-2 font-mono text-xs focus:ring-1 focus:ring-forest-800 focus:outline-none"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={handleTriggerMpesaStk}
                      className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded text-xs transition shadow flex items-center justify-center space-x-2"
                    >
                      <Smartphone className="w-4 h-4" />
                      <span>Send M-Pesa Prompt (KES {Number(stkAmount).toLocaleString()})</span>
                    </button>
                  </div>

                  {stkStatus && (
                    <div className="mt-4 p-3 rounded border text-xs font-mono">
                      {stkStatus === 'REQUESTED' && (
                        <div className="text-amber-700 bg-amber-50 border-amber-200 p-2 rounded">
                          Handshaking with Safaricom Daraja API gateway...
                        </div>
                      )}
                      {stkStatus === 'SENT_TO_PHONE' && (
                        <div className="text-blue-700 bg-blue-50 border-blue-200 p-2 rounded animate-pulse">
                          STK Push prompt sent to {stkPhoneNumber}. Awaiting PIN entry...
                        </div>
                      )}
                      {stkStatus === 'SUCCESS' && (
                        <div className="text-emerald-800 bg-emerald-50 border-emerald-300 p-2.5 rounded">
                          <div className="font-bold flex items-center">
                            <CheckCircle2 className="w-4 h-4 mr-1.5 text-emerald-600" />
                            PAYMENT CONFIRMED (M-Pesa Code: SHB94819KL)
                          </div>
                          <div className="mt-1 text-[11px] text-emerald-700">
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
            <div className="bg-white p-6 rounded-lg border border-sand-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-serif text-lg font-bold text-forest-900">
                    Clinical Detoxification Assessment & Protocol Calculator
                  </h2>
                  <p className="text-xs text-calyvia-muted">
                    Clinical Institute Withdrawal Assessment for Alcohol (CIWA-Ar) & Clinical Opiate Withdrawal Scale (COWS)
                  </p>
                </div>
                <span className="px-2.5 py-1 bg-terracotta-100 text-terracotta-600 text-xs font-bold rounded">
                  High Acuity Protocol
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-sans mt-4">
                <div className="p-4 bg-sand-50 rounded border border-sand-200">
                  <h3 className="font-bold text-forest-900 text-sm">Nausea & Vomiting (0-7)</h3>
                  <p className="text-calyvia-muted text-[11px] mt-1">Currently scored: 3 (Mild nausea with dry heaves)</p>
                </div>
                <div className="p-4 bg-sand-50 rounded border border-sand-200">
                  <h3 className="font-bold text-forest-900 text-sm">Tremors (0-7)</h3>
                  <p className="text-calyvia-muted text-[11px] mt-1">Currently scored: 4 (Moderate with arms extended)</p>
                </div>
                <div className="p-4 bg-sand-50 rounded border border-sand-200">
                  <h3 className="font-bold text-forest-900 text-sm">Paroxysmal Sweats (0-7)</h3>
                  <p className="text-calyvia-muted text-[11px] mt-1">Currently scored: 3 (Beads of sweat obvious on forehead)</p>
                </div>
              </div>
            </div>
          )}

          {/* Fallback for other modules */}
          {activeModule !== 'dashboard' && activeModule !== 'billing' && activeModule !== 'detox' && (
            <div className="bg-white p-8 rounded-lg border border-sand-200 shadow-sm text-center space-y-3">
              <div className="w-12 h-12 bg-sage-100 text-forest-800 rounded-full flex items-center justify-center mx-auto">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h2 className="font-serif text-xl font-bold text-forest-900 capitalize">
                {activeModule.replace('_', ' ')} Management View
              </h2>
              <p className="text-xs text-calyvia-muted max-w-md mx-auto">
                Module actively mounted. Full operational entity controls, data tables, and REST API endpoints available at <code className="text-forest-800 font-mono">/api/v1/{activeModule}</code>.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
