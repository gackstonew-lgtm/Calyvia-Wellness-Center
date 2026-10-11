'use client';

import React, { useState, useEffect } from 'react';
import { Download, X, Share, PlusSquare, CheckCircle2, Smartphone, Monitor } from 'lucide-react';
import { useTheme } from './ThemeProvider';

// BeforeInstallPromptEvent type definition
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

const DISMISSAL_KEY = 'calyvia_pwa_banner_dismissed_at';
const DISMISSAL_DAYS = 7; // Suppress for 7 days upon manual dismissal

export const PwaInstallBanner: React.FC = () => {
  const { theme } = useTheme();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [isIos, setIsIos] = useState<boolean>(false);
  const [showIosInstructions, setShowIosInstructions] = useState<boolean>(false);
  const [installedSuccess, setInstalledSuccess] = useState<boolean>(false);

  useEffect(() => {
    // 1. Register Service Worker in supported production/secure environments
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js', { scope: '/' })
          .then((reg) => {
            // Check for updates
            reg.onupdatefound = () => {
              const installingWorker = reg.installing;
              if (installingWorker) {
                installingWorker.onstatechange = () => {
                  if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    // New content is available
                    console.log('[SW] New version available. Reload to update.');
                  }
                };
              }
            };
          })
          .catch((err) => {
            console.warn('[SW] Registration notice:', err);
          });
      });
    }

    // 2. Check if already running in standalone (installed) mode
    const checkIsStandalone = () => {
      const isStandaloneMedia = window.matchMedia('(display-mode: standalone)').matches;
      const isStandaloneNavigator = (navigator as any).standalone === true;
      return isStandaloneMedia || isStandaloneNavigator;
    };

    if (checkIsStandalone()) {
      setIsInstalled(true);
      return;
    }

    // 3. Check dismissal persistence
    const checkDismissal = () => {
      try {
        const dismissedAt = localStorage.getItem(DISMISSAL_KEY);
        if (dismissedAt) {
          const diffDays = (Date.now() - parseInt(dismissedAt, 10)) / (1000 * 60 * 60 * 24);
          if (diffDays < DISMISSAL_DAYS) {
            return true; // Still within dismissal cooldown
          }
        }
      } catch {
        // Fallback for private browsing
      }
      return false;
    };

    const isDismissed = checkDismissal();

    // 4. Detect iOS / iPadOS Safari (which doesn't support beforeinstallprompt)
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice =
      /iphone|ipad|ipod/.test(userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

    const isSafari = /safari/.test(userAgent) && !/chrome|crios|fxios/.test(userAgent);

    if (isIosDevice && isSafari && !isDismissed) {
      setIsIos(true);
      setIsVisible(true);
    }

    // 5. Chromium beforeinstallprompt listener
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);

      if (!isDismissed) {
        setIsVisible(true);
      }
    };

    // 6. App Installed event listener
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsVisible(false);
      setDeferredPrompt(null);
      setInstalledSuccess(true);
      setTimeout(() => setInstalledSuccess(false), 4000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIos) {
      setShowIosInstructions(true);
      return;
    }

    if (!deferredPrompt) {
      // In desktop browsers without pending prompt, show helpful instructions
      setShowIosInstructions(true);
      return;
    }

    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsVisible(false);
        setInstalledSuccess(true);
        setTimeout(() => setInstalledSuccess(false), 4000);
      }
      setDeferredPrompt(null);
    } catch (err) {
      console.warn('[PWA] Prompt error:', err);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setShowIosInstructions(false);
    try {
      localStorage.setItem(DISMISSAL_KEY, Date.now().toString());
    } catch {
      // Fallback
    }
  };

  // If already installed, hide banner
  if (isInstalled && !installedSuccess) {
    return null;
  }

  // Installation Success Toast
  if (installedSuccess) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="fixed bottom-5 left-4 sm:left-6 md:left-[19.5rem] z-40 flex items-center space-x-3 px-4 py-3 rounded-2xl bg-emerald-600 text-white shadow-elevated border border-emerald-500/30 animate-in fade-in slide-in-from-bottom-2 duration-200"
      >
        <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-white" />
        <div className="text-xs font-semibold">
          <span>Calyvia installed successfully!</span>
          <p className="text-[11px] text-emerald-100 font-normal">Launch directly from your home screen or app drawer.</p>
        </div>
      </div>
    );
  }

  if (!isVisible) {
    return null;
  }

  return (
    <div
      role="region"
      aria-label="Application Installation"
      className="fixed bottom-5 left-4 sm:left-6 md:left-[19.5rem] z-40 max-w-sm w-[calc(100vw-2rem)] sm:w-88 bg-surface/95 backdrop-blur-md border border-border rounded-2xl shadow-elevated p-3.5 sm:p-4 text-foreground transition-all duration-200 animate-in fade-in slide-in-from-bottom-3"
    >
      <div className="flex items-start justify-between gap-3">
        {/* Emblem & Branding */}
        <div className="flex items-start space-x-3 min-w-0 flex-1">
          <div className="relative w-10 h-10 flex-shrink-0 bg-primary-soft p-1.5 rounded-xl border border-primary/20 shadow-xs flex items-center justify-center">
            <img
              src={theme === 'dark' ? '/brand/calyvia-emblem-dark.svg' : '/brand/calyvia-emblem-light.svg'}
              alt="Calyvia Emblem"
              width={26}
              height={26}
              className="w-6 h-6 object-contain"
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center space-x-1.5">
              <h3 className="text-xs font-bold font-serif text-foreground leading-tight">Install Calyvia</h3>
              <span className="px-1.5 py-0.2 rounded-md bg-primary-soft text-primary text-[9px] font-mono font-semibold">
                PWA
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
              Get quick access to your wellness center dashboard.
            </p>
          </div>
        </div>

        {/* Close / Dismiss Button */}
        <button
          onClick={handleDismiss}
          aria-label="Dismiss installation banner"
          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-surface-elevated transition-colors flex-shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Manual iOS/Safari Guidance Drawer */}
      {showIosInstructions && (
        <div className="mt-3 pt-3 border-t border-border/80 text-[11px] text-muted-foreground space-y-1.5 bg-surface-subtle p-2.5 rounded-xl">
          <div className="font-semibold text-foreground flex items-center gap-1.5">
            <Smartphone className="w-3.5 h-3.5 text-primary" />
            <span>How to install on iOS / Safari:</span>
          </div>
          <ol className="list-decimal list-inside space-y-1 pl-1 text-[10.5px]">
            <li className="leading-tight">
              Tap the <span className="font-semibold text-foreground inline-flex items-center gap-0.5"><Share className="w-3 h-3 text-primary inline" /> Share</span> button in Safari&apos;s toolbar.
            </li>
            <li className="leading-tight">
              Scroll down and tap <span className="font-semibold text-foreground inline-flex items-center gap-0.5"><PlusSquare className="w-3 h-3 text-primary inline" /> Add to Home Screen</span>.
            </li>
            <li className="leading-tight">
              Tap <span className="font-semibold text-foreground">Add</span> in the top-right corner.
            </li>
          </ol>
        </div>
      )}

      {/* Actions Bar */}
      <div className="mt-3 flex items-center justify-between gap-2 pt-1">
        <div className="flex items-center space-x-1.5 text-[10px] text-muted-foreground hidden sm:flex">
          <Monitor className="w-3 h-3 text-muted-foreground/70" />
          <span>Android • Windows • Mac • iOS</span>
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
          <button
            onClick={handleDismiss}
            className="px-3 py-1.5 rounded-xl text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-surface-elevated transition-colors"
          >
            Not now
          </button>
          <button
            onClick={handleInstallClick}
            aria-label="Install Calyvia App"
            className="flex-1 sm:flex-none inline-flex items-center justify-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary-hover shadow-xs active:scale-[0.98] transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Install App</span>
          </button>
        </div>
      </div>
    </div>
  );
};
