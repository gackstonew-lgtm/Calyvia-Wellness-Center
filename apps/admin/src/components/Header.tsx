'use client';

import React, { useState, useEffect } from 'react';
import { Search, Bell, Shield, Phone, Clock, Sun, Moon } from 'lucide-react';
import { useTheme } from './ThemeProvider';

export const Header: React.FC = () => {
  const [time, setTime] = useState<string>('');
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
    <header className="h-16 bg-surface border-b border-border px-6 flex items-center justify-between shadow-xs z-10 transition-colors duration-200">
      {/* Brand Logo & Search Input */}
      <div className="flex items-center space-x-6">
        {/* Responsive Logo Banner (Adapts Light / Dark) */}
        <div className="hidden lg:flex items-center h-10 w-48 relative">
          <img
            src={theme === 'dark' ? '/brand/calyvia-logo-dark.svg' : '/brand/calyvia-logo-light.svg'}
            alt="Calyvia Wellness Center"
            className="h-9 w-auto max-w-[190px] object-contain transition-opacity duration-200"
          />
        </div>

        {/* Global Search Input */}
        <div className="relative w-72 sm:w-80">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search patient by CAL-ID, name, or phone..."
            className="w-full bg-surface-subtle border border-border rounded-lg pl-9 pr-3 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/40 placeholder:text-muted-foreground transition-colors"
          />
        </div>
      </div>

      {/* Facility, Clock, Theme Switcher & Staff Context */}
      <div className="flex items-center space-x-3 sm:space-x-4 text-xs">
        {/* Nairobi Clock */}
        <div className="hidden sm:flex items-center space-x-1.5 text-muted-foreground font-mono bg-surface-subtle px-2.5 py-1.5 rounded-lg border border-border">
          <Clock className="w-3.5 h-3.5 text-primary" />
          <span>{time || '12:00:00'} EAT</span>
        </div>

        {/* Emergency Helpline */}
        <div className="hidden md:flex items-center space-x-1.5 text-primary font-medium bg-primary-soft px-2.5 py-1.5 rounded-lg border border-primary/20">
          <Phone className="w-3.5 h-3.5 text-primary" />
          <span>+254 700 534 306</span>
        </div>

        {/* Theme Toggle Button (Light / Dark Switcher inspired by QC NetCore) */}
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className="w-9 h-9 rounded-xl bg-surface border border-border text-foreground flex items-center justify-center hover:bg-surface-elevated hover:border-primary/50 hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 shadow-xs"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-[#1F4E28]" />
          )}
        </button>

        {/* Alerts Pill */}
        <button
          title="Active Clinical Alerts"
          aria-label="Active Clinical Alerts"
          className="relative p-2 rounded-xl border border-border bg-surface hover:bg-surface-elevated text-foreground transition-all duration-200 shadow-xs"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent rounded-full animate-pulse" />
        </button>

        {/* User Profile Pill */}
        <div className="flex items-center space-x-2.5 border-l border-border pl-3 sm:pl-4">
          <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs shadow-xs">
            DB
          </div>
          <div className="hidden sm:block text-left">
            <div className="font-semibold text-foreground leading-tight flex items-center space-x-1">
              <span>Dr. Baraka</span>
              <Shield className="w-3 h-3 text-secondary" />
            </div>
            <div className="text-[10px] text-muted-foreground">Medical Director / Admin</div>
          </div>
        </div>
      </div>
    </header>
  );
};
