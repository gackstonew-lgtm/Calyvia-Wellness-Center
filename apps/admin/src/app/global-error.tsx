'use client';

import React, { useEffect } from 'react';
import { AlertTriangle, RotateCcw, ShieldAlert } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Calyvia Root Global Error:', error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col items-center justify-center p-6 antialiased font-sans">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl space-y-6 text-center">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-sm">
            <AlertTriangle className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              HTTP 500 • Application Recovery
            </span>
            <h1 className="text-2xl font-bold tracking-tight">
              Application Error
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              A critical rendering fault occurred. Patient data and audit sessions remain protected. Please retry or refresh the application.
            </p>
            {error?.digest && (
              <p className="text-[10px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 py-1 px-2 rounded-lg inline-block">
                Digest: {error.digest}
              </p>
            )}
          </div>

          <div className="pt-2 flex items-center justify-center">
            <button
              onClick={() => reset()}
              className="inline-flex items-center justify-center space-x-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reload Calyvia Portal</span>
            </button>
          </div>

          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-400 flex items-center justify-center space-x-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-emerald-600" />
            <span>Calyvia Wellness Center • Ruiru, Kenya</span>
          </div>
        </div>
      </body>
    </html>
  );
}
