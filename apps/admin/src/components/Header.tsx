'use client';

import React, { useState, useEffect } from 'react';
import { Search, Bell, Shield, Phone, Clock } from 'lucide-react';

export const Header: React.FC = () => {
  const [time, setTime] = useState<string>('');

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
    <header className="h-16 bg-white border-b border-sand-200 px-6 flex items-center justify-between shadow-sm z-10">
      {/* Search Input */}
      <div className="flex items-center space-x-3 w-96">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-sand-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search patient by CAL-ID, name, or phone..."
            className="w-full bg-sand-50 border border-sand-200 rounded-md pl-9 pr-3 py-1.5 text-xs text-calyvia-dark focus:outline-none focus:border-forest-800 focus:ring-1 focus:ring-sage-400 placeholder-sand-500"
          />
        </div>
      </div>

      {/* Facility & Staff Context */}
      <div className="flex items-center space-x-5 text-xs">
        {/* Nairobi Clock */}
        <div className="flex items-center space-x-1.5 text-calyvia-muted font-mono bg-sand-50 px-2.5 py-1 rounded border border-sand-200">
          <Clock className="w-3.5 h-3.5 text-forest-800" />
          <span>{time || '12:00:00'} EAT</span>
        </div>

        {/* Emergency Helpline */}
        <div className="hidden md:flex items-center space-x-1.5 text-forest-800 font-medium bg-sage-50 px-2.5 py-1 rounded border border-sage-200">
          <Phone className="w-3.5 h-3.5 text-forest-800" />
          <span>Helpdesk: +254 700 534 306</span>
        </div>

        {/* Alerts Pill */}
        <button
          title="Active Clinical Alerts"
          className="relative p-1.5 rounded-full hover:bg-sand-100 text-calyvia-dark transition"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-0 right-0 w-2 h-2 bg-terracotta-500 rounded-full animate-pulse" />
        </button>

        {/* User Profile Pill */}
        <div className="flex items-center space-x-2.5 border-l border-sand-200 pl-4">
          <div className="w-8 h-8 rounded-full bg-forest-800 text-white flex items-center justify-center font-bold text-xs">
            DB
          </div>
          <div className="text-left">
            <div className="font-semibold text-calyvia-dark leading-tight flex items-center space-x-1">
              <span>Dr. Baraka</span>
              <Shield className="w-3 h-3 text-sage-500" />
            </div>
            <div className="text-[10px] text-calyvia-muted">Medical Director / Admin</div>
          </div>
        </div>
      </div>
    </header>
  );
};
