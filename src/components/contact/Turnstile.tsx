"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

type TurnstileApi = {
  render: (el: HTMLElement, opts: Record<string, unknown>) => string;
  reset: (id?: string) => void;
  remove: (id: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
let scriptPromise: Promise<void> | null = null;

function loadScript(): Promise<void> {
  if (window.turnstile) return Promise.resolve();
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve, reject) => {
    // Inserted by our (nonce-trusted) bundle → allowed by CSP 'strict-dynamic'.
    const s = document.createElement("script");
    s.src = SCRIPT_SRC;
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => {
      scriptPromise = null;
      reject(new Error("turnstile-load-failed"));
    };
    document.head.appendChild(s);
  });
  return scriptPromise;
}

export type TurnstileHandle = { reset: () => void };

type Props = {
  siteKey: string;
  locale: string;
  onToken: (token: string) => void;
  onExpire: () => void;
  onError: () => void;
};

/** Cloudflare Turnstile widget (explicit render). The token is verified server-side only. */
export const Turnstile = forwardRef<TurnstileHandle, Props>(function Turnstile({ siteKey, locale, onToken, onExpire, onError }, ref) {
  const container = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const callbacks = useRef({ onToken, onExpire, onError });
  callbacks.current = { onToken, onExpire, onError };

  useImperativeHandle(ref, () => ({
    reset: () => {
      if (widgetId.current && window.turnstile) window.turnstile.reset(widgetId.current);
    },
  }));

  useEffect(() => {
    let cancelled = false;
    loadScript()
      .then(() => {
        if (cancelled || !container.current || !window.turnstile) return;
        widgetId.current = window.turnstile.render(container.current, {
          sitekey: siteKey,
          action: "contact",
          theme: "dark",
          size: "flexible",
          language: locale === "zh-TW" ? "zh-tw" : "en",
          callback: (t: string) => callbacks.current.onToken(t),
          "expired-callback": () => callbacks.current.onExpire(),
          "error-callback": () => callbacks.current.onError(),
        });
      })
      .catch(() => callbacks.current.onError());
    return () => {
      cancelled = true;
      if (widgetId.current && window.turnstile) window.turnstile.remove(widgetId.current);
      widgetId.current = null;
    };
  }, [siteKey, locale]);

  return <div ref={container} className="min-h-[65px] w-full" />;
});
