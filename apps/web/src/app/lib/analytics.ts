"use client";

export type AnalyticsPayload = Record<string, string | number | boolean | null | undefined>;

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
    gtag?: (...args: unknown[]) => void;
  }
}

export function trackEvent(event: string, payload: AnalyticsPayload = {}) {
  if (typeof window === "undefined") return;

  const entry = { event, ...payload };
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(entry);

  if (typeof window.gtag === "function") {
    window.gtag("event", event, payload);
  }

  if (process.env.NODE_ENV !== "production") {
    console.info("[analytics]", entry);
  }
}

