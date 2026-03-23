'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

const Analytics = dynamic(
  () => import('@vercel/analytics/react').then((module) => module.Analytics),
  { ssr: false },
);

const SpeedInsights = dynamic(
  () => import('@vercel/speed-insights/next').then((module) => module.SpeedInsights),
  { ssr: false },
);

const IDLE_FALLBACK_DELAY_MS = 2500;

type IdleWindow = Window & {
  requestIdleCallback?: (callback: IdleRequestCallback, options?: IdleRequestOptions) => number;
  cancelIdleCallback?: (id: number) => void;
};

export default function DeferredInsights() {
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      return;
    }

    if (process.env.NEXT_PUBLIC_ENABLE_INSIGHTS === 'false') {
      return;
    }

    if (typeof window === 'undefined') {
      return;
    }

    const idleWindow = window as IdleWindow;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let idleId: number | null = null;

    const enable = () => {
      setShouldRender(true);
    };

    if (idleWindow.requestIdleCallback) {
      idleId = idleWindow.requestIdleCallback(enable, {
        timeout: IDLE_FALLBACK_DELAY_MS,
      });
    } else {
      timeoutId = globalThis.setTimeout(enable, IDLE_FALLBACK_DELAY_MS);
    }

    return () => {
      if (idleId !== null && idleWindow.cancelIdleCallback) {
        idleWindow.cancelIdleCallback(idleId);
      }

      if (timeoutId !== null) {
        globalThis.clearTimeout(timeoutId);
      }
    };
  }, []);

  if (!shouldRender) {
    return null;
  }

  return (
    <>
      <Analytics />
      <SpeedInsights />
    </>
  );
}
