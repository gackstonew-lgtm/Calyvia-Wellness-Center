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
  LayoutDashboard,
  X,
  ShieldCheck,
} from 'lucide-react';
import { useTheme } from './ThemeProvider';

interface SidebarProps {
  currentModule: string;
  onSelectModule: (moduleId: string) => void;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentModule,
  onSelectModule,
  mobileOpen = false,
  onCloseMobile,
}) => {
  const { theme } = useTheme();

  const moduleSections = [
    {
      category: 'Overview & Executive',
      items: [
        { id: 'dashboard', name: 'Management Dashboard', icon: LayoutDashboard },
        { id: 'reports', name: 'Reports & Analytics', icon: FileSpreadsheet },
      ],
    },
    {
      category: 'Intake & Relationships',
      items: [
        { id: 'patients', name: 'Patient Registry', icon: Users },
        { id: 'crm', name: 'CRM & Admissions Pipeline', icon: UserCheck },
        { id: 'family', name: 'Family Management', icon: Heart },
        { id: 'referrals', name: 'Referral Partners', icon: Share2 },
        { id: 'documents', name: 'Digital Forms & Consents', icon: FileText },
      ],
    },
    {
      category: 'Clinical & Inpatient Care',
      items: [
        { id: 'clinical', name: 'Clinical Records & MDT', icon: Stethoscope },
        { id: 'detox', name: 'Detox (CIWA/COWS & Vitals)', icon: Activity },
        { id: 'counselling', name: 'Counselling & Therapy', icon: HeartHandshake },
        { id: 'appointments', name: 'Appointments & Calendar', icon: Calendar },
        { id: 'pharmacy', name: 'Pharmacy & e-MAR Chart', icon: Pill },
        { id: 'rooms', name: 'Rooms & Bed Allocation', icon: BedDouble },
      ],
    },
    {
      category: 'Finance, Operations & Safety',
      items: [
        { id: 'billing', name: 'Billing & Daraja M-Pesa', icon: CreditCard },
        { id: 'movement', name: 'Movement & Visitors', icon: Footprints },
        { id: 'incidents', name: 'Incidents & Risk Matrix', icon: ShieldAlert },
        { id: 'staff', name: 'Staff & Licence Roster', icon: UserCog },
        { id: 'tasks', name: 'Task Management', icon: CheckSquare },
        { id: 'inventory', name: 'Stores & Inventory', icon: PackageCheck },
      ],
    },
    {
      category: 'Transitions & Recovery',
      items: [
        { id: 'discharge', name: 'Discharge Management', icon: LogOut },
        { id: 'aftercare', name: 'Aftercare & Recovery', icon: Repeat },
        { id: 'communication', name: 'SMS & WhatsApp Hub', icon: MessageSquare },
        { id: 'feedback', name: 'Feedback & Complaints', icon: Smile },
      ],
    },
    {
      category: 'Governance & Extensions',
      items: [
        { id: 'security', name: 'Security & Audit Trail', icon: Lock },
        { id: 'system_admin', name: 'System Administration', icon: Settings },
        { id: 'integrations', name: 'Integrations & Webhooks', icon: Webhook },
        { id: 'automation', name: 'BullMQ Automation', icon: Zap },
        { id: 'ai_extension', name: 'AI Extension Boundary', icon: Sparkles },
      ],
    },
  ];

  const handleItemClick = (id: string) => {
    onSelectModule(id);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const sidebarContent = (
    <div className="w-72 bg-surface text-foreground h-full flex flex-col border-r border-border select-none overflow-hidden transition-colors duration-200">
      {/* Brand Header with Optimized Transparent Logo */}
      <div className="p-4 bg-surface border-b border-border flex items-center justify-between">
        <div className="flex items-center space-x-3 w-full">
          <div className="relative w-10 h-10 flex-shrink-0 bg-primary-soft p-1.5 rounded-xl border border-primary/20 shadow-xs flex items-center justify-center">
            <img
              src={theme === 'dark' ? '/brand/calyvia-emblem-dark.svg' : '/brand/calyvia-emblem-light.svg'}
              alt="Calyvia Emblem"
              width={28}
              height={28}
              className="w-7 h-7 object-contain"
            />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="font-serif text-base font-bold tracking-tight text-foreground leading-tight truncate">
              Calyvia Wellness
            </h1>
            <p className="text-[11px] text-muted-foreground font-sans truncate">Ruiru, Kenya • HMIS / EMR</p>
          </div>
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="md:hidden p-1.5 rounded-lg text-muted-foreground hover:bg-surface-elevated hover:text-foreground"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Navigation List with rounded pill design inspired by Holistic */}
      <div className="flex-1 overflow-y-auto py-3 px-3 space-y-4 text-xs font-sans">
        {moduleSections.map((section, idx) => (
          <div key={idx} className="space-y-1">
            <h2 className="px-3 text-[10px] uppercase font-bold tracking-wider text-muted-foreground/80">
              {section.category}
            </h2>
            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive = currentModule === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item.id)}
                  className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl transition-all duration-150 text-left ${
                    isActive
                      ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                      : 'text-muted-foreground hover:bg-surface-subtle hover:text-foreground'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 flex-shrink-0 ${
                      isActive ? 'text-primary-foreground' : 'text-muted-foreground/70'
                    }`}
                  />
                  <span className="truncate">{item.name}</span>
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* User Profile Card & Sign Out at Bottom */}
      <div className="p-3 bg-surface-subtle border-t border-border space-y-2">
        <div className="flex items-center justify-between p-2 rounded-xl bg-surface border border-border shadow-xs">
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="relative w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-xs">
              <span>DB</span>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-surface" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-foreground truncate flex items-center gap-1">
                <span>Dr. Antony Baraka</span>
              </div>
              <p className="text-[10px] text-muted-foreground truncate">Medical Director / Admin</p>
            </div>
          </div>
          <button
            title="Sign Out"
            aria-label="Sign Out"
            onClick={() => alert('Authentication session locked. Re-authenticate to access sensitive EMR data.')}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-danger hover:bg-danger-soft transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        {/* Server & Compliance Status */}
        <div className="px-2 py-1 flex items-center justify-between text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Supabase: Connected</span>
          </span>
          <span className="font-mono text-secondary">KDPA 2019</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:flex flex-shrink-0 h-screen sticky top-0 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Sliding Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          {/* Sidebar Drawer */}
          <div className="relative z-10 w-72 max-w-[85vw] h-full shadow-2xl animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};

