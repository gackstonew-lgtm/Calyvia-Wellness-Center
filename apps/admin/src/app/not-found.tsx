'use client';

import React from 'react';
import Link from 'next/link';
import { Home, ArrowLeft, ShieldAlert } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 text-center select-none">
      <div className="max-w-md w-full bg-surface border border-border rounded-3xl p-8 shadow-elevated space-y-6">
        {/* Emblem / Badge */}
        <div className="w-16 h-16 mx-auto rounded-2xl bg-primary-soft border border-primary/20 flex items-center justify-center text-primary shadow-xs">
          <ShieldAlert className="w-8 h-8 text-primary" />
        </div>

        {/* Text */}
        <div className="space-y-2">
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-primary">
            HTTP 404 • Resource Not Found
          </span>
          <h1 className="font-serif text-2xl font-bold text-foreground">
            Module or Record Unavailable
          </h1>
          <p className="text-xs text-muted-foreground leading-relaxed">
            The requested clinical module, patient record, or administrative route does not exist or has been relocated within the Calyvia EMR.
          </p>
        </div>

        {/* Action */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="w-full inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary-hover shadow-xs transition-all active:scale-[0.98]"
          >
            <Home className="w-4 h-4" />
            <span>Return to Dashboard</span>
          </Link>
        </div>

        <div className="pt-2 border-t border-border/60 text-[11px] text-muted-foreground">
          Calyvia Wellness Center • Ruiru, Kenya
        </div>
      </div>
    </div>
  );
}
