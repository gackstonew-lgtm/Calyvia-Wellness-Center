'use client';

import React, { useEffect } from 'react';
import { AlertTriangle, RotateCcw, Home, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to monitoring in production
    console.error('Calyvia Admin Route Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 text-center select-none">
      <div className="max-w-md w-full bg-surface border border-border rounded-3xl p-8 shadow-elevated space-y-6">
        {/* Emblem / Badge */}
        <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-xs">
          <AlertTriangle className="w-8 h-8" />
        </div>

        {/* Text */}
        <div className="space-y-2">
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
            System Notice • Error Boundary
          </span>
          <h1 className="font-serif text-2xl font-bold text-foreground">
            Module Temporarily Unavailable
          </h1>
          <p className="text-xs text-muted-foreground leading-relaxed">
            An unexpected error occurred while rendering this interface. System state has been safely preserved to protect clinical data integrity.
          </p>
          {error?.digest && (
            <p className="text-[10px] font-mono text-muted-foreground/80 bg-muted/30 py-1 px-2 rounded-lg border border-border/40 inline-block">
              Digest: {error.digest}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary-hover shadow-xs transition-all active:scale-[0.98]"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Retry Action</span>
          </button>
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl bg-muted/60 hover:bg-muted text-foreground text-xs font-semibold border border-border/80 shadow-xs transition-all active:scale-[0.98]"
          >
            <Home className="w-4 h-4" />
            <span>Return to Dashboard</span>
          </Link>
        </div>

        <div className="pt-2 border-t border-border/60 text-[11px] text-muted-foreground flex items-center justify-center space-x-1.5">
          <ShieldAlert className="w-3.5 h-3.5 text-primary" />
          <span>Calyvia Wellness Center • Ruiru, Kenya</span>
        </div>
      </div>
    </div>
  );
}
