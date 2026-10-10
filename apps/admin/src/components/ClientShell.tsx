'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

const DynamicCalyviaAiAssistant = dynamic(
  () => import('./CalyviaAiAssistant').then((mod) => mod.CalyviaAiAssistant),
  { ssr: false }
);

const DynamicPwaInstallBanner = dynamic(
  () => import('./PwaInstallBanner').then((mod) => mod.PwaInstallBanner),
  { ssr: false }
);

/**
 * ClientShell isolates client-only floating interfaces (PWA installation prompt & AI copilot)
 * from server-side prerendering, guaranteeing zero SSR hydration collisions or hook dispatcher faults.
 */
export function ClientShell() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <>
      <DynamicPwaInstallBanner />
      <DynamicCalyviaAiAssistant />
    </>
  );
}
