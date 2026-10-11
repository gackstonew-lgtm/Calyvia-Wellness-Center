'use client';

import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Stethoscope,
  HeartHandshake,
  Calendar,
  Building2,
  CreditCard,
  Pill,
  UserCog,
  FileText,
  ShieldAlert,
  MessageSquare,
  BarChart3,
  Sliders,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
  LucideIcon,
} from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { useAuth } from './AuthContext';
import { canAccessModule, ROLE_DISPLAY_NAMES } from '@calyvia/shared';

export interface SubmoduleItem {
  id: string;
  name: string;
}

export interface PrimaryModuleItem {
  id: string;
  name: string;
  icon: LucideIcon;
  submodules?: SubmoduleItem[];
}

export interface NavigationSection {
  category: string;
  modules: PrimaryModuleItem[];
}

export const NAVIGATION_STRUCTURE: NavigationSection[] = [
  {
    category: 'OVERVIEW',
    modules: [
      {
        id: 'dashboard',
        name: 'Management Dashboard',
        icon: LayoutDashboard,
      },
      {
        id: 'reports',
        name: 'Reports & Analytics',
        icon: BarChart3,
      },
    ],
  },
  {
    category: 'PATIENT SERVICES',
    modules: [
      {
        id: 'patients',
        name: 'Patients & Family',
        icon: Users,
        submodules: [
          { id: 'patients', name: 'Patient Registry & Profiles' },
          { id: 'family', name: 'Family Management & Contacts' },
        ],
      },
      {
        id: 'crm',
        name: 'Admissions & Referrals',
        icon: UserCheck,
        submodules: [
          { id: 'crm', name: 'CRM & Intake Pipeline' },
          { id: 'referrals', name: 'Referral Partners' },
        ],
      },
      {
        id: 'counselling',
        name: 'Counselling & Therapy',
        icon: HeartHandshake,
      },
      {
        id: 'appointments',
        name: 'Appointments & Calendar',
        icon: Calendar,
      },
      {
        id: 'documents',
        name: 'Documents, Discharge & Aftercare',
        icon: FileText,
        submodules: [
          { id: 'documents', name: 'Digital Forms & Consents' },
          { id: 'discharge', name: 'Discharge Records & Checklist' },
          { id: 'aftercare', name: 'Aftercare & Recovery Cadence' },
        ],
      },
    ],
  },
  {
    category: 'CLINICAL & FACILITY',
    modules: [
      {
        id: 'clinical',
        name: 'Clinical Care & Detox',
        icon: Stethoscope,
        submodules: [
          { id: 'clinical', name: 'Clinical Records & Notes' },
          { id: 'detox', name: 'Detox (CIWA/COWS & Vitals)' },
        ],
      },
      {
        id: 'rooms',
        name: 'Facility & Patient Flow',
        icon: Building2,
        submodules: [
          { id: 'rooms', name: 'Rooms & Bed Allocation' },
          { id: 'movement', name: 'Movement, Leaves & Visitors' },
        ],
      },
      {
        id: 'pharmacy',
        name: 'Pharmacy & Inventory',
        icon: Pill,
        submodules: [
          { id: 'pharmacy', name: 'Pharmacy & e-MAR Chart' },
          { id: 'inventory', name: 'Stores & General Inventory' },
        ],
      },
      {
        id: 'incidents',
        name: 'Incidents & Risk',
        icon: ShieldAlert,
      },
    ],
  },
  {
    category: 'OPERATIONS',
    modules: [
      {
        id: 'billing',
        name: 'Billing & Payments',
        icon: CreditCard,
      },
      {
        id: 'staff',
        name: 'Staff & Tasks',
        icon: UserCog,
        submodules: [
          { id: 'staff', name: 'Staff Profiles & Roster' },
          { id: 'tasks', name: 'Task Management & Handovers' },
        ],
      },
      {
        id: 'communication',
        name: 'Communications & Feedback',
        icon: MessageSquare,
        submodules: [
          { id: 'communication', name: 'SMS & WhatsApp Broadcast' },
          { id: 'feedback', name: 'Patient Feedback & Complaints' },
        ],
      },
    ],
  },
  {
    category: 'SYSTEM',
    modules: [
      {
        id: 'system_admin',
        name: 'Administration & Intelligence',
        icon: Sliders,
        submodules: [
          { id: 'system_admin', name: 'System Settings' },
          { id: 'security', name: 'User Accounts & Security' },
          { id: 'integrations', name: 'Integrations & Webhooks' },
          { id: 'automation', name: 'Workflow Automation' },
          { id: 'ai_extension', name: 'AI Assistant & Intelligence' },
        ],
      },
    ],
  },
];

interface SidebarProps {
  currentModule: string;
  onSelectModule: (moduleId: string) => void;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentModule,
  onSelectModule,
  mobileOpen = false,
  onCloseMobile,
  isCollapsed = false,
  onToggleCollapse,
}) => {
  const { theme } = useTheme();
  const { user, logout } = useAuth();

  // Find parent module of a given subId
  const getParentModuleId = (subId: string): string => {
    for (const section of NAVIGATION_STRUCTURE) {
      for (const mod of section.modules) {
        if (mod.id === subId) return mod.id;
        if (mod.submodules?.some((sub) => sub.id === subId)) return mod.id;
      }
    }
    return subId;
  };

  const activeParentId = getParentModuleId(currentModule);

  // Expanded parent modules in sidebar
  const [expandedParents, setExpandedParents] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    if (activeParentId) {
      initial[activeParentId] = true;
    }
    return initial;
  });

  // Automatically expand parent module whenever currentModule changes
  useEffect(() => {
    if (activeParentId) {
      setExpandedParents((prev) => ({
        ...prev,
        [activeParentId]: true,
      }));
    }
  }, [activeParentId]);

  const toggleParentExpand = (moduleId: string) => {
    setExpandedParents((prev) => ({
      ...prev,
      [moduleId]: !prev[moduleId],
    }));
  };

  // Filter structure based on role access
  const visibleSections = NAVIGATION_STRUCTURE.map((section) => {
    const modules = section.modules
      .map((mod) => {
        // If module has submodules, filter submodules by role permission
        if (mod.submodules && mod.submodules.length > 0) {
          const allowedSubmodules = mod.submodules.filter((sub) =>
            canAccessModule(user?.role, sub.id)
          );
          if (allowedSubmodules.length === 0) return null;
          return {
            ...mod,
            submodules: allowedSubmodules,
          };
        }
        // Direct module check
        if (!canAccessModule(user?.role, mod.id)) return null;
        return mod;
      })
      .filter((m): m is PrimaryModuleItem => m !== null);

    return {
      category: section.category,
      modules,
    };
  }).filter((section) => section.modules.length > 0);

  const handleSelect = (targetId: string) => {
    onSelectModule(targetId);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const displayName = user?.fullName || 'Clinical Staff';
  const roleTitle = user?.role ? (ROLE_DISPLAY_NAMES[user.role] || user.role) : 'Medical Director / Admin';
  const initials = user?.fullName
    ? user.fullName
        .split(' ')
        .map((n) => n[0])
        .filter(Boolean)
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'CW';

  const sidebarContent = (
    <div
      className={`${
        isCollapsed ? 'w-20' : 'w-72'
      } bg-surface text-foreground h-full flex flex-col border-r border-border select-none overflow-hidden transition-all duration-300`}
    >
      {/* Brand Header with Transparent Logo & Collapse Arrow Button */}
      <div className="p-4 bg-surface border-b border-border flex items-center justify-between">
        <div className="flex items-center space-x-3 min-w-0 flex-1">
          <div className="relative w-10 h-10 flex-shrink-0 bg-primary-soft p-1.5 rounded-xl border border-primary/20 shadow-xs flex items-center justify-center">
            <img
              src={theme === 'dark' ? '/brand/calyvia-emblem-dark.svg' : '/brand/calyvia-emblem-light.svg'}
              alt="Calyvia Emblem"
              width={28}
              height={28}
              className="w-7 h-7 object-contain"
            />
          </div>
          {!isCollapsed && (
            <div className="min-w-0 flex-1">
              <h1 className="font-serif text-base font-bold tracking-tight text-foreground leading-tight truncate">
                Calyvia Wellness
              </h1>
              <p className="text-[11px] text-muted-foreground font-sans truncate">Ruiru, Kenya • HMIS / EMR</p>
            </div>
          )}
        </div>

        {/* Desktop Collapse / Expand Arrow Button */}
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="hidden md:flex p-1.5 rounded-xl border border-border bg-surface-subtle hover:bg-surface-elevated text-muted-foreground hover:text-foreground transition-all duration-150 flex-shrink-0"
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4 text-primary" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        )}

        {/* Mobile Close Button */}
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

      {/* Navigation List with 5 Visual Sections & Consolidated 15 Primary Modules */}
      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-4 text-xs font-sans">
        {visibleSections.map((section, idx) => (
          <div key={idx} className="space-y-1">
            {!isCollapsed && (
              <h2 className="px-3 text-[10px] uppercase font-bold tracking-wider text-muted-foreground/80">
                {section.category}
              </h2>
            )}
            {section.modules.map((mod) => {
              const Icon = mod.icon;
              const hasSub = mod.submodules && mod.submodules.length > 0;
              const isDirectActive = currentModule === mod.id;
              const isChildActive = mod.submodules?.some((sub) => sub.id === currentModule);
              const isParentActive = isDirectActive || isChildActive;
              const isExpanded = !!expandedParents[mod.id];

              if (isCollapsed) {
                // Collapsed state: icon-only button triggering default subfeature
                const defaultTarget = mod.submodules ? mod.submodules[0].id : mod.id;
                return (
                  <button
                    key={mod.id}
                    onClick={() => handleSelect(defaultTarget)}
                    title={mod.name}
                    aria-label={mod.name}
                    className={`w-full flex items-center justify-center px-2 py-3 rounded-2xl transition-all duration-150 ${
                      isParentActive
                        ? 'bg-primary text-primary-foreground font-semibold shadow-xs dark:shadow-[0_2px_12px_-2px_rgba(0,230,118,0.3)]'
                        : 'text-muted-foreground hover:bg-surface-subtle hover:text-foreground'
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 flex-shrink-0 ${
                        isParentActive ? 'text-primary-foreground' : 'text-muted-foreground/70'
                      }`}
                    />
                  </button>
                );
              }

              // Expanded state: accordion with primary module and nested submodules
              return (
                <div key={mod.id} className="space-y-0.5">
                  <div className="flex items-center">
                    <button
                      onClick={() => {
                        if (hasSub) {
                          // If already on one of its children or direct, toggle expand
                          // Otherwise navigate to default child and ensure expanded
                          if (isParentActive) {
                            toggleParentExpand(mod.id);
                          } else {
                            const defaultTarget = mod.submodules ? mod.submodules[0].id : mod.id;
                            setExpandedParents((prev) => ({ ...prev, [mod.id]: true }));
                            handleSelect(defaultTarget);
                          }
                        } else {
                          handleSelect(mod.id);
                        }
                      }}
                      title={mod.name}
                      aria-label={mod.name}
                      className={`flex-1 flex items-center justify-between space-x-2.5 px-3 py-2 rounded-2xl transition-all duration-150 text-left ${
                        isParentActive
                          ? 'bg-primary/10 text-primary font-semibold'
                          : 'text-muted-foreground hover:bg-surface-subtle hover:text-foreground'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <Icon
                          className={`w-4 h-4 flex-shrink-0 ${
                            isParentActive ? 'text-primary' : 'text-muted-foreground/70'
                          }`}
                        />
                        <span className="truncate">{mod.name}</span>
                      </div>
                      {hasSub && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleParentExpand(mod.id);
                          }}
                          className="p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/5 text-muted-foreground/80 hover:text-foreground"
                          aria-label={isExpanded ? `Collapse ${mod.name}` : `Expand ${mod.name}`}
                        >
                          <ChevronDown
                            className={`w-3.5 h-3.5 transition-transform duration-200 ${
                              isExpanded ? 'rotate-180 text-primary' : ''
                            }`}
                          />
                        </button>
                      )}
                    </button>
                  </div>

                  {/* Submenu Items */}
                  {hasSub && isExpanded && (
                    <div className="ml-5 pl-3 border-l border-border/70 space-y-0.5 py-1 animate-in fade-in-50 duration-150">
                      {mod.submodules!.map((sub) => {
                        const isSubActive = currentModule === sub.id;
                        return (
                          <button
                            key={sub.id}
                            onClick={() => handleSelect(sub.id)}
                            className={`w-full text-left px-2.5 py-1.5 rounded-xl text-[11px] font-medium transition-all duration-150 truncate block ${
                              isSubActive
                                ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                                : 'text-muted-foreground hover:text-foreground hover:bg-surface-subtle'
                            }`}
                          >
                            {sub.name}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* User Profile Card & Sign Out at Bottom */}
      <div className="p-3 bg-surface-subtle border-t border-border space-y-2">
        <div
          className={`flex items-center ${
            isCollapsed ? 'justify-center p-1.5' : 'justify-between p-2'
          } rounded-xl bg-surface border border-border shadow-xs`}
        >
          <div className="flex items-center space-x-2.5 min-w-0">
            <div
              className="relative w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-xs"
              title={displayName}
            >
              <span>{initials}</span>
              <span className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-500 rounded-full border-2 border-surface" />
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <div className="text-xs font-semibold text-foreground truncate flex items-center gap-1">
                  <span>{displayName}</span>
                </div>
                <p className="text-[10px] text-muted-foreground truncate">{roleTitle}</p>
              </div>
            )}
          </div>
          {!isCollapsed && (
            <button
              title="Sign Out"
              aria-label="Sign Out"
              onClick={logout}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-danger hover:bg-danger-soft transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:flex flex-shrink-0 h-screen sticky top-0 z-30 transition-all duration-300">
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
