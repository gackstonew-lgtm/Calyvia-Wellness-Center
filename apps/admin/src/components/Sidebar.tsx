'use client';

import React from 'react';
import {
  Users,
  UserCheck,
  Stethoscope,
  Activity,
  HeartHandshake,
  Calendar,
  CreditCard,
  Pill,
  BedDouble,
  Footprints,
  ShieldAlert,
  UserCog,
  CheckSquare,
  PackageCheck,
  FileText,
  LogOut,
  Repeat,
  Heart,
  Share2,
  MessageSquare,
  Smile,
  BarChart3,
  FileSpreadsheet,
  Lock,
  Settings,
  Webhook,
  Zap,
  Sparkles,
  LayoutDashboard
} from 'lucide-react';

interface SidebarProps {
  currentModule: string;
  onSelectModule: (moduleId: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentModule, onSelectModule }) => {
  const moduleSections = [
    {
      category: 'Overview & Executive',
      items: [
        { id: 'dashboard', name: '22. Management Dashboard', icon: LayoutDashboard },
        { id: 'reports', name: '23. Reports & Analytics', icon: FileSpreadsheet },
      ],
    },
    {
      category: 'Intake & Relationships',
      items: [
        { id: 'patients', name: '01. Patient Registry', icon: Users },
        { id: 'crm', name: '02. CRM & Admissions Pipeline', icon: UserCheck },
        { id: 'family', name: '18. Family Management', icon: Heart },
        { id: 'referrals', name: '19. Referral Partners', icon: Share2 },
        { id: 'documents', name: '15. Digital Forms & Consents', icon: FileText },
      ],
    },
    {
      category: 'Clinical & Inpatient Care',
      items: [
        { id: 'clinical', name: '03. Clinical Records & MDT', icon: Stethoscope },
        { id: 'detox', name: '04. Detox (CIWA/COWS & Vitals)', icon: Activity },
        { id: 'counselling', name: '05. Counselling & Therapy', icon: HeartHandshake },
        { id: 'appointments', name: '06. Appointments & Calendar', icon: Calendar },
        { id: 'pharmacy', name: '08. Pharmacy & e-MAR Chart', icon: Pill },
        { id: 'rooms', name: '09. Rooms & Bed Allocation', icon: BedDouble },
      ],
    },
    {
      category: 'Finance, Operations & Safety',
      items: [
        { id: 'billing', name: '07. Billing & Daraja M-Pesa', icon: CreditCard },
        { id: 'movement', name: '10. Movement & Visitors', icon: Footprints },
        { id: 'incidents', name: '11. Incidents & Risk Matrix', icon: ShieldAlert },
        { id: 'staff', name: '12. Staff & Licence Roster', icon: UserCog },
        { id: 'tasks', name: '13. Task Management', icon: CheckSquare },
        { id: 'inventory', name: '14. Stores & Inventory', icon: PackageCheck },
      ],
    },
    {
      category: 'Transitions & Recovery',
      items: [
        { id: 'discharge', name: '16. Discharge Management', icon: LogOut },
        { id: 'aftercare', name: '17. Aftercare & Recovery', icon: Repeat },
        { id: 'communication', name: '20. SMS & WhatsApp Hub', icon: MessageSquare },
        { id: 'feedback', name: '21. Feedback & Complaints', icon: Smile },
      ],
    },
    {
      category: 'Governance & Extensions',
      items: [
        { id: 'security', name: '24. Security & Audit Trail', icon: Lock },
        { id: 'system_admin', name: '25. System Administration', icon: Settings },
        { id: 'integrations', name: '26. Integrations & Webhooks', icon: Webhook },
        { id: 'automation', name: '27. BullMQ Automation', icon: Zap },
        { id: 'ai_extension', name: '28. AI Extension Boundary', icon: Sparkles },
      ],
    },
  ];

  return (
    <aside className="w-72 bg-forest-900 text-sand-50 h-screen flex flex-col flex-shrink-0 border-r border-forest-800 select-none overflow-hidden">
      {/* Brand Header */}
      <div className="p-4 bg-forest-900 border-b border-forest-800 flex items-center space-x-3">
        <div className="w-10 h-10 rounded-lg bg-forest-800 border border-sage-400/40 flex items-center justify-center font-serif text-xl font-bold text-sage-400 shadow-sm">
          C
        </div>
        <div>
          <h1 className="font-serif text-lg font-bold tracking-tight text-white leading-tight">
            Calyvia Wellness
          </h1>
          <p className="text-xs text-sage-300 font-sans">Ruiru, Kenya • HMIS</p>
        </div>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-4 text-xs font-sans">
        {moduleSections.map((section, idx) => (
          <div key={idx} className="space-y-1">
            <h2 className="px-2 text-[10px] uppercase font-bold tracking-wider text-sage-400/70">
              {section.category}
            </h2>
            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive = currentModule === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectModule(item.id)}
                  className={`w-full flex items-center space-x-2.5 px-2.5 py-2 rounded-md transition-all text-left ${
                    isActive
                      ? 'bg-forest-800 text-white font-medium border-l-4 border-sage-400 shadow-sm'
                      : 'text-sand-300 hover:bg-forest-800/50 hover:text-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-sage-400' : 'text-sand-400'}`} />
                  <span className="truncate">{item.name}</span>
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Footer Info */}
      <div className="p-3 bg-forest-900/90 border-t border-forest-800 text-[11px] text-sand-400">
        <div className="flex items-center justify-between">
          <span>Server: Online</span>
          <span className="text-sage-400 font-mono">EAT (UTC+3)</span>
        </div>
        <p className="text-[10px] text-sand-500 mt-0.5">KDPA 2019 Compliant</p>
      </div>
    </aside>
  );
};
