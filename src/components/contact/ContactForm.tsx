"use client";

import { useId, useRef, useState, type ReactNode } from "react";
import { useLocale, useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { AlertTriangle, ArrowRight, CheckCircle2, ChevronDown, Loader2, Lock } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { LIMITS, contactSchema, fieldErrors, serviceOptions, type ContactResponse } from "@/lib/contact-schema";
import { Turnstile, type TurnstileHandle } from "./Turnstile";

type Service = (typeof serviceOptions)[number];
type Fields = {
  name: string;
  email: string;
  company: string;
  country: string;
  service: Service | "";
  message: string;
  consent: boolean;
  website: string;
};

type Props = {
  siteKey: string | null;
  services: Array<{ value: Service; label: string }>;
  defaultService?: Service;
};

type ErrorKey = Parameters<ReturnType<typeof useTranslations<"contact.errors">>>[0];
const FIELD_ORDER = ["name", "email", "company", "country", "service", "message", "consent"];

/**
 * Contact form. Client-side validation is for convenience only; the API route re-validates
 * everything with the same schema and adds rate limiting, honeypot, Turnstile and origin checks.
 */
export function ContactForm({ siteKey, services, defaultService }: Props) {
  const t = useTranslations("contact.form");
  const te = useTranslations("contact.errors");
  const locale = useLocale();
  const uid = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const turnstile = useRef<TurnstileHandle>(null);
  const idemKey = useRef<string | null>(null);

  const initial: Fields = {
    name: "",
    email: "",
    company: "",
    country: "",
    service: defaultService ?? "",
    message: "",
    consent: false,
    website: "",
  };
  const [fields, setFields] = useState<Fields>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [token, setToken] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");

  const set = <K extends keyof Fields>(key: K, value: Fields[K]) => {
    setFields((f) => ({ ...f, [key]: value }));
    if (errors[key])
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
  };

  const msg = (key: string | undefined) => (key ? te(key as ErrorKey) : undefined);
  const id = (name: string) => `${uid}-${name}`;
  const describedBy = (name: string) => (errors[name] ? `${id(name)}-error` : undefined);

  const applyErrors = (all: Record<string, string>) => {
    const { turnstileToken, form, ...fieldErrs } = all;
    setErrors(fieldErrs);
    if (form) setFormError(te("invalidRequest"));
    else if (Object.keys(fieldErrs).length) setFormError(te("fixFields"));
    else if (turnstileToken) setFormError(te(siteKey ? "turnstileRequired" : "turnstileUnavailable"));
    const first = FIELD_ORDER.find((k) => fieldErrs[k]);
    if (first) formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "submitting") return; // double-submit guard
    setFormError(null);

    const payload = { ...fields, turnstileToken: token, locale };
    const check = contactSchema.safeParse(payload);
    if (!check.success) {
      applyErrors(fieldErrors(check.error));
      return;
    }

    setStatus("submitting");
    idemKey.current ??= crypto.randomUUID();
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Idempotency-Key": idemKey.current },
        body: JSON.stringify(payload),
        credentials: "same-origin",
      });
      const data = (await res.json().catch(() => ({ ok: false, error: "server" }))) as ContactResponse;
      if (data.ok) {
        setStatus("success");
        return;
      }
      setStatus("idle");
      // Turnstile tokens are single-use: always fetch a fresh one after a failed attempt.
      setToken("");
      turnstile.current?.reset();
      if (data.error === "validation" && data.fields) {
        applyErrors(data.fields);
      } else {
        idemKey.current = null;
        setFormError(te(data.error === "validation" ? "invalidRequest" : data.error));
      }
    } catch {
      setStatus("idle");
      setFormError(te("network"));
    }
  }

  function reset() {
    setFields(initial);
    setErrors({});
    setFormError(null);
    setToken("");
    idemKey.current = null;
    setStatus("idle");
  }

  if (status === "success") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="flex min-h-[30rem] flex-col items-center justify-center text-center"
        role="status"
        aria-live="polite"
      >
        <div className="relative grid h-24 w-24 place-items-center">
          <span className="absolute inset-0 animate-ping rounded-full bg-gold/20" />
          <span className="absolute inset-0 rounded-full border border-gold/40 bg-gold/10" />
          <CheckCircle2 aria-hidden className="relative h-10 w-10 text-gold" />
        </div>
        <h2 className="mt-8 text-h2 font-medium">{t("success.title")}</h2>
        <p className="mt-4 max-w-md text-muted">{t("success.description")}</p>
        <button type="button" onClick={reset} className="btn btn-ghost mt-8">
          {t("success.again")}
        </button>
      </motion.div>
    );
  }

  const busy = status === "submitting";
  const input = (name: "name" | "email" | "company" | "country", extra: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input
      id={id(name)}
      name={name}
      className="field"
      value={fields[name]}
      onChange={(e) => set(name, e.target.value)}
      aria-invalid={!!errors[name]}
      aria-describedby={describedBy(name)}
      {...extra}
    />
  );

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate>
      <h2 className="text-h3 font-medium">{t("title")}</h2>

      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        <Field id={id("name")} label={t("name")} required error={msg(errors.name)} hint={t("required")}>
          {input("name", { autoComplete: "name", maxLength: LIMITS.name, placeholder: t("namePlaceholder"), required: true })}
        </Field>
        <Field id={id("email")} label={t("email")} required error={msg(errors.email)} hint={t("required")}>
          {input("email", { type: "email", inputMode: "email", autoComplete: "email", maxLength: LIMITS.email, placeholder: t("emailPlaceholder"), required: true })}
        </Field>
        <Field id={id("company")} label={t("company")} error={msg(errors.company)} hint={t("optional")}>
          {input("company", { autoComplete: "organization", maxLength: LIMITS.company, placeholder: t("companyPlaceholder") })}
        </Field>
        <Field id={id("country")} label={t("country")} required error={msg(errors.country)} hint={t("required")}>
          {input("country", { autoComplete: "country-name", maxLength: LIMITS.country, placeholder: t("countryPlaceholder"), required: true })}
        </Field>
      </div>

      <div className="mt-5">
        <Field id={id("service")} label={t("service")} required error={msg(errors.service)} hint={t("required")}>
          <div className="relative">
            <select
              id={id("service")}
              name="service"
              className="field appearance-none pr-10"
              value={fields.service}
              onChange={(e) => set("service", e.target.value as Service)}
              aria-invalid={!!errors.service}
              aria-describedby={describedBy("service")}
              required
            >
              <option value="" disabled>
                {t("servicePlaceholder")}
              </option>
              {services.map((s) => (
                <option key={s.value} value={s.value} className="bg-ink-900">
                  {s.label}
                </option>
              ))}
            </select>
            <ChevronDown aria-hidden className="pointer-events-none absolute top-1/2 right-4 h-4 w-4 -translate-y-1/2 text-muted" />
          </div>
        </Field>
      </div>

      <div className="mt-5">
        <Field
          id={id("message")}
          label={t("message")}
          required
          error={msg(errors.message)}
          hint={t("characters", { count: fields.message.length, max: LIMITS.message })}
        >
          <textarea
            id={id("message")}
            name="message"
            rows={6}
            className="field resize-y"
            maxLength={LIMITS.message}
            placeholder={t("messagePlaceholder")}
            value={fields.message}
            onChange={(e) => set("message", e.target.value)}
            aria-invalid={!!errors.message}
            aria-describedby={describedBy("message")}
            required
          />
        </Field>
      </div>

      {/* Honeypot: hidden from people and assistive tech, attractive to bots. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor={id("website")}>{t("honeypot")}</label>
        <input id={id("website")} name="website" type="text" tabIndex={-1} autoComplete="off" value={fields.website} onChange={(e) => set("website", e.target.value)} />
      </div>

      <div className="mt-6">
        <label className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed text-muted">
          <input
            type="checkbox"
            name="consent"
            checked={fields.consent}
            onChange={(e) => set("consent", e.target.checked)}
            aria-invalid={!!errors.consent}
            aria-describedby={describedBy("consent")}
            className="mt-1 h-4 w-4 shrink-0 accent-accent"
          />
          <span>
            {t.rich("consent", {
              link: (chunks) => (
                <Link href="/privacy" className="text-accent underline underline-offset-4">
                  {chunks}
                </Link>
              ),
            })}
          </span>
        </label>
        {errors.consent ? (
          <p id={`${id("consent")}-error`} className="mt-2 text-sm text-danger">
            {msg(errors.consent)}
          </p>
        ) : null}
      </div>

      <div className="mt-6" role="group" aria-label={t("turnstileLabel")}>
        {siteKey ? (
          <Turnstile
            ref={turnstile}
            siteKey={siteKey}
            locale={locale}
            onToken={(tk) => {
              setToken(tk);
              setFormError(null);
            }}
            onExpire={() => setToken("")}
            onError={() => {
              setToken("");
              setFormError(te("turnstileUnavailable"));
            }}
          />
        ) : (
          <p className="text-sm text-amber">{te("turnstileUnavailable")}</p>
        )}
      </div>

      <div aria-live="assertive">
        {formError ? (
          <p role="alert" className="mt-5 flex items-start gap-2.5 rounded-xl border border-danger/40 bg-danger/10 p-4 text-sm text-fg">
            <AlertTriangle aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-danger" />
            {formError}
          </p>
        ) : null}
      </div>

      <div className="mt-7 flex flex-col-reverse items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-center gap-2 text-xs text-subtle">
          <Lock aria-hidden className="h-3.5 w-3.5 text-gold" />
          {t("secureNote")}
        </p>
        <button type="submit" disabled={busy} aria-busy={busy} className="btn btn-primary w-full disabled:cursor-wait disabled:opacity-70 sm:w-auto">
          {busy ? (
            <>
              <Loader2 aria-hidden className="h-4 w-4 animate-spin" />
              {t("submitting")}
            </>
          ) : (
            <>
              {t("submit")}
              <ArrowRight aria-hidden className="h-4 w-4" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}

function Field({ id, label, required, error, hint, children }: { id: string; label: string; required?: boolean; error?: string; hint?: string; children: ReactNode }) {
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-sm font-medium text-fg/90">
          {label}
          {required ? (
            <span className="ml-1 text-accent" aria-hidden>
              *
            </span>
          ) : null}
        </label>
        {hint ? <span className="font-label text-[0.68rem] text-subtle">{hint}</span> : null}
      </div>
      {children}
      {error ? (
        <p id={`${id}-error`} className="mt-2 text-sm text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
