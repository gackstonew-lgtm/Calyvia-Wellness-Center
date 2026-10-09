'use client';

import React, { useState, useEffect } from 'react';
import { Search, Bell, Shield, Phone, Clock, Sun, Moon, Menu, Settings } from 'lucide-react';
import { useTheme } from './ThemeProvider';

interface HeaderProps {
  onToggleMobileMenu?: () => void;
  onSelectModule?: (moduleId: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleMobileMenu, onSelectModule }) => {
  const [time, setTime] = useState<string>('');
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString('en-KE', {
          timeZone: 'Africa/Nairobi',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }),
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-16 bg-surface border-b border-border px-4 sm:px-6 flex items-center justify-between shadow-xs z-20 transition-colors duration-200">
      {/* Left: Mobile Menu Toggle & Search Bar */}
      <div className="flex items-center space-x-3 sm:space-x-4 flex-1 max-w-xl">
        {/* Mobile Hamburger Toggle */}
        <button
          onClick={onToggleMobileMenu}
          className="md:hidden p-2 rounded-xl border border-border text-foreground hover:bg-surface-elevated transition-colors"
          aria-label="Open sidebar menu"
        >
          <Menu className="w-5 h-5 text-foreground" />
        </button>

        {/* Global Search Input with Shortcut */}
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search patient, record, appointment, CAL-ID..."
            className="w-full bg-surface-subtle border border-border rounded-xl pl-9 pr-16 py-2 text-xs text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground transition-all"
          />
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 hidden sm:flex items-center space-x-0.5">
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground bg-surface border border-border rounded shadow-xs">
              ⌘K
            </kbd>
          </div>
        </div>
      </div>

      {/* Right: Facility Context, Time, Actions, Theme & Profile */}
      <div className="flex items-center space-x-2 sm:space-x-3 text-xs">
        {/* Nairobi Clock */}
        <div className="hidden lg:flex items-center space-x-1.5 text-muted-foreground font-mono bg-surface-subtle px-2.5 py-1.5 rounded-xl border border-border">
          <Clock className="w-3.5 h-3.5 text-primary" />
          <span>{time || '12:00:00'} EAT</span>
        </div>

        {/* Emergency Helpline */}
        <div className="hidden xl:flex items-center space-x-1.5 text-primary font-medium bg-primary-soft px-2.5 py-1.5 rounded-xl border border-primary/20">
          <Phone className="w-3.5 h-3.5 text-primary" />
          <span>+254 700 534 306</span>
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className="w-9 h-9 rounded-xl bg-surface border border-border text-foreground flex items-center justify-center hover:bg-surface-elevated hover:border-primary/50 hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 shadow-xs"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-primary" />
          )}
        </button>

        {/* Settings Button */}
        <button
          onClick={() => onSelectModule && onSelectModule('system_admin')}
          title="System Settings"
          aria-label="System Settings"
          className="w-9 h-9 rounded-xl bg-surface border border-border text-muted-foreground hover:text-foreground flex items-center justify-center hover:bg-surface-elevated hover:border-primary/50 hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 shadow-xs"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* Clinical Alerts / Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            title="Active Clinical Alerts"
            aria-label="Active Clinical Alerts"
            className="w-9 h-9 rounded-xl border border-border bg-surface hover:bg-surface-elevated text-foreground flex items-center justify-center hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 shadow-xs relative"
          >
            <Bell className="w-4 h-4 text-muted-foreground" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-accent rounded-full animate-pulse" />
          </button>

          {/* Notifications Dropdown Preview */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-surface border border-border rounded-2xl shadow-elevated p-3 z-50 animate-in fade-in-50 zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <span className="font-semibold text-xs text-foreground">Clinical Alerts (3)</span>
                <span className="text-[10px] text-primary font-medium cursor-pointer hover:underline">
                  Mark all read
                </span>
              </div>
              <div className="divide-y divide-border text-xs mt-1">
                <div className="py-2 space-y-0.5">
                  <div className="font-medium text-danger flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-danger" />
                    <span>CIWA Vitals Re-check Due</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">John Kamau (Bed 02) requires 14:00 CIWA-Ar scoring.</p>
                </div>
                <div className="py-2 space-y-0.5">
                  <div className="font-medium text-warning flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-warning" />
                    <span>Pharmacy Re-order Level</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">Diazepam 10mg inventory has dropped to 14 ampoules.</p>
                </div>
                <div className="py-2 space-y-0.5">
                  <div className="font-medium text-info flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-info" />
                    <span>New Admission Enquiry</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">Admissions team received intake referral from Nairobi West.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Pill */}
        <div className="flex items-center space-x-2.5 border-l border-border pl-2.5 sm:pl-3">
          <div className="relative w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs shadow-xs">
            <span>DB</span>
            <span className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-500 rounded-full border-2 border-surface" />
          </div>
          <div className="hidden sm:block text-left">
            <div className="font-semibold text-foreground leading-tight flex items-center space-x-1">
              <span>Dr. Baraka</span>
              <Shield className="w-3 h-3 text-secondary" />
            </div>
            <div className="text-[10px] text-muted-foreground">Medical Director</div>
          </div>
        </div>
      </div>
    </header>
  );
};
