import { Link, createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Sparkles,
  ShieldCheck,
} from "lucide-react";

import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { TicketPass } from "@/components/bits/ticket-pass";
import { RegisterAtmosphere } from "@/components/home/register-atmosphere";
import { REG_FIELDS, EVENT, type FieldKey } from "@/lib/content";
import {
  addRegistration,
  findLikelyDuplicate,
  listRegistrations,
  type RegistrationInput,
} from "@/lib/registration";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Register — Sahasaknaada" },
      {
        name: "description",
        content:
          "Register for Sahasaknaada, the inter-school audio workshop by the Radio Club of D. S. Senanayake College.",
      },
      { property: "og:title", content: "Register — Sahasaknaada" },
      {
        property: "og:description",
        content:
          "Register for Sahasaknaada, the inter-school audio workshop by the Radio Club of D. S. Senanayake College.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RegisterPage,
});

type Status = "idle" | "submitting" | "success" | "duplicate" | "error";

function RegisterPage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <RegisterAtmosphere />
      <SiteHeader />
      <main className="relative z-10 mx-auto w-full max-w-[1200px] px-5 py-12 sm:px-8 md:py-16">
        <RegisterLayout />
      </main>
      <SiteFooter />
    </div>
  );
}

function RegisterLayout() {
  return (
    <div className="grid items-start gap-10 md:grid-cols-[0.92fr_1.08fr] md:gap-14 lg:gap-20">
      {/* Left column — event identity & experience */}
      <div className="flex flex-col gap-7">
        <Link
          to="/"
          className="reg-rise inline-flex w-fit items-center gap-2 rounded-md text-sm font-medium text-[var(--reg-text-2)] transition-colors hover:text-[var(--reg-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--reg-gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--reg-bg)]"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back to home
        </Link>

        <span className="reg-rise reg-rise-2 inline-flex w-fit items-center gap-2 rounded-full border border-[var(--reg-gold-edge)] bg-[rgba(231,181,74,0.06)] px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--reg-gold)]">
          <Sparkles className="h-3.5 w-3.5" aria-hidden />
          Inter-school audio workshop
        </span>

        <h1 className="reg-rise reg-rise-3 font-display text-4xl font-bold leading-[1.02] tracking-tight text-[var(--reg-text)] text-balance sm:text-5xl md:text-[3.4rem]">
          Register for{" "}
          <span className="bg-gradient-to-br from-[var(--reg-gold-2)] to-[var(--reg-gold)] bg-clip-text text-transparent">
            Sahasaknaada
          </span>
        </h1>

        <p className="reg-rise reg-rise-4 max-w-md text-base leading-relaxed text-[var(--reg-text-2)] text-pretty">
          Fill in your details to register for the inter-school audio workshop. Your pass is
          generated once your registration is received.
        </p>

        <Waveform />

        <div className="reg-rise reg-rise-5 mt-1 flex items-center gap-3 rounded-xl border border-[var(--reg-edge)] bg-[rgba(20,23,28,0.5)] p-3.5">
          <img
            src={EVENT.logoUrl}
            alt="Sahasaknaada official event logo"
            className="h-10 w-10 shrink-0 object-contain"
          />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-[var(--reg-text)]">{EVENT.host}</p>
            <p className="truncate text-xs text-[var(--reg-text-muted)]">{EVENT.tagline}</p>
          </div>
        </div>

        <p className="reg-rise reg-rise-6 flex items-center gap-2 text-xs text-[var(--reg-text-muted)]">
          <ShieldCheck className="h-4 w-4 text-[var(--reg-gold)]/80" aria-hidden />
          Your details are only used to manage your registration.
        </p>
      </div>

      {/* Right column — registration form */}
      <div className="reg-rise reg-rise-4">
        <RegisterForm />
      </div>
    </div>
  );
}

/* Calm, editorial decorative waveform — not an equalizer dashboard. */
function Waveform() {
  const bars = Array.from({ length: 28 }, (_, i) =>
    Math.round(28 + 52 * Math.abs(Math.sin(i * 0.6)) + 14 * Math.abs(Math.cos(i * 0.34))),
  );
  return (
    <div
      className="reg-rise reg-rise-5 flex h-12 items-center gap-[3px] overflow-hidden"
      aria-hidden
    >
      {bars.map((h, i) => (
        <span
          key={i}
          className="wave-bar w-[3px] shrink-0 rounded-full bg-gradient-to-t from-[var(--reg-gold)]/30 to-[var(--reg-gold)]/85"
          style={{
            height: `${h}%`,
            animationDelay: `${(i % 10) * 110}ms`,
            animationDuration: "1.6s",
          }}
        />
      ))}
    </div>
  );
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[0-9+\-\s()]{7,20}$/;

function RegisterForm() {
  const [values, setValues] = useState<Record<FieldKey, string>>({
    fullName: "",
    school: "",
    grade: "",
    email: "",
    phone: "",
    notes: "",
  });
  const [errors, setErrors] = useState<Partial<Record<FieldKey, string>>>({});
  const [status, setStatus] = useState<Status>("idle");
  const [code, setCode] = useState<string>("");
  const [touched, setTouched] = useState<Partial<Record<FieldKey, boolean>>>({});

  function validate(onSubmit = false): Partial<Record<FieldKey, string>> {
    const next: Partial<Record<FieldKey, string>> = {};
    for (const f of REG_FIELDS) {
      const v = (values[f.key] ?? "").trim();
      const isTouched = onSubmit || touched[f.key];
      if (f.required && !v && isTouched) {
        next[f.key] = `${f.label.replace(/\s*\(.*\)/, "")} is required.`;
        continue;
      }
      if (!v) continue;
      if (!isTouched && !onSubmit) continue;
      if (f.key === "email" && !EMAIL_RE.test(v)) {
        next[f.key] = "Enter a valid email address.";
      }
      if (f.key === "phone" && !PHONE_RE.test(v)) {
        next[f.key] = "Enter a valid contact number.";
      }
      if (v.length > f.maxLength) {
        next[f.key] = `Keep this under ${f.maxLength} characters.`;
      }
    }
    return next;
  }

  function onBlur(key: FieldKey) {
    setTouched((t) => ({ ...t, [key]: true }));
    setErrors(validate());
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "submitting") return;
    const found = validate(true);
    setErrors(found);
    setTouched({
      fullName: true,
      school: true,
      grade: true,
      email: true,
      phone: true,
      notes: true,
    });
    if (Object.keys(found).length > 0) {
      setStatus("idle");
      const firstInvalid = REG_FIELDS.find((f) => found[f.key]);
      if (firstInvalid) {
        document.getElementById(`field-${firstInvalid.key}`)?.focus();
      }
      return;
    }
    setStatus("submitting");
    try {
      // Honest round-trip so the submitting state is real; the write happens
      // before success is shown.
      await new Promise((r) => setTimeout(r, 550));
      const input: RegistrationInput = {
        fullName: values.fullName,
        school: values.school,
        grade: values.grade,
        email: values.email,
        phone: values.phone,
        notes: values.notes,
      };
      const dup = findLikelyDuplicate(input, listRegistrations());
      const { record } = addRegistration(input);
      setCode(record.code);
      setStatus(dup ? "duplicate" : "success");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <SuccessPanel
        code={code}
        name={values.fullName}
        onReset={() => {
          setValues({ fullName: "", school: "", grade: "", email: "", phone: "", notes: "" });
          setStatus("idle");
          setCode("");
          setErrors({});
          setTouched({});
        }}
      />
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="reg-panel relative overflow-hidden px-6 py-8 sm:px-9 sm:py-9"
    >
      {/* Subtle warm highlight along the top edge */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-[var(--reg-gold-edge)] to-transparent"
      />
      {/* Faint inner top sheen */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[1.5rem] bg-gradient-to-b from-white/[0.03] to-transparent"
      />

      <div className="relative">
        <div className="mb-7 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span
                aria-hidden
                className="h-5 w-1 rounded-full bg-gradient-to-b from-[var(--reg-gold-2)] to-[var(--reg-gold)]"
              />
              <h2 className="font-display text-2xl font-bold tracking-tight text-[var(--reg-text)]">
                Your registration
              </h2>
            </div>
            <p className="mt-2 text-sm text-[var(--reg-text-2)]">
              Fill in your details to register for {EVENT.name}.
            </p>
            <p className="mt-1 text-xs text-[var(--reg-text-muted)]">
              Fields marked <span className="text-[var(--reg-gold)]">*</span> are required.
            </p>
          </div>
        </div>

        {status === "duplicate" && (
          <div
            className="mb-6 flex items-start gap-3 rounded-xl border border-[rgba(247,138,110,0.3)] bg-[rgba(247,138,110,0.07)] p-4 text-sm text-[var(--reg-text)]"
            role="status"
          >
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#f78a6e]" aria-hidden />
            <p>
              We may already have a registration under this name or email (code{" "}
              <strong className="font-semibold text-[var(--reg-gold)]">{code}</strong>). Your new
              registration was still saved — the organizers will review it.
            </p>
          </div>
        )}

        <div className="grid gap-5 sm:grid-cols-2">
          {REG_FIELDS.map((f) => {
            const isNotes = f.key === "notes";
            const err = errors[f.key];
            return (
              <div key={f.key} className={cn("flex flex-col gap-2", isNotes && "sm:col-span-2")}>
                <label
                  htmlFor={`field-${f.key}`}
                  className="text-sm font-medium text-[var(--reg-text)]"
                >
                  {f.label}
                  {f.required && (
                    <span className="ml-1 text-[var(--reg-gold)]" aria-hidden>
                      *
                    </span>
                  )}
                </label>
                {isNotes ? (
                  <textarea
                    id={`field-${f.key}`}
                    name={f.key}
                    value={values[f.key]}
                    maxLength={f.maxLength}
                    onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
                    onBlur={() => onBlur(f.key)}
                    aria-invalid={!!err}
                    aria-describedby={err ? `${f.key}-error` : undefined}
                    rows={3}
                    className="reg-input w-full px-3.5 py-2.5 text-sm placeholder:text-[var(--reg-text-muted)]"
                  />
                ) : (
                  <input
                    id={`field-${f.key}`}
                    name={f.key}
                    type={f.type}
                    inputMode={f.key === "phone" ? "tel" : f.key === "email" ? "email" : "text"}
                    autoComplete={
                      f.key === "email"
                        ? "email"
                        : f.key === "phone"
                          ? "tel"
                          : f.key === "fullName"
                            ? "name"
                            : "off"
                    }
                    value={values[f.key]}
                    maxLength={f.maxLength}
                    onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
                    onBlur={() => onBlur(f.key)}
                    aria-invalid={!!err}
                    aria-describedby={err ? `${f.key}-error` : undefined}
                    className="reg-input w-full px-3.5 py-2.5 text-base placeholder:text-[var(--reg-text-muted)]"
                  />
                )}
                {f.hint && !err && <p className="text-xs text-[var(--reg-text-muted)]">{f.hint}</p>}
                {err && (
                  <p
                    id={`${f.key}-error`}
                    role="alert"
                    className="text-xs font-medium text-[#f78a6e]"
                  >
                    {err}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-7 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-2 text-xs text-[var(--reg-text-muted)]">
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
            Your details are only used to manage your registration.
          </p>
          <button
            type="submit"
            disabled={status === "submitting"}
            className="reg-cta inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--reg-gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--reg-raised)] disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
          >
            {status === "submitting" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                Submitting registration…
              </>
            ) : (
              <>
                Submit registration
                <ArrowRight
                  className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                  aria-hidden
                />
              </>
            )}
          </button>
        </div>

        {status === "error" && (
          <p role="alert" className="mt-4 text-sm font-medium text-[#f78a6e]">
            Something went wrong submitting your registration. Please try again.
          </p>
        )}
      </div>
    </form>
  );
}

function SuccessPanel({
  code,
  name,
  onReset,
}: {
  code: string;
  name: string;
  onReset: () => void;
}) {
  return (
    <div className="reg-panel relative overflow-hidden px-6 py-10 text-center sm:px-12 sm:py-12">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-[var(--reg-gold-edge)] to-transparent"
      />
      <div
        className="reg-rise mx-auto grid h-16 w-16 place-items-center rounded-full border border-[var(--reg-gold-edge)] bg-[rgba(231,181,74,0.1)] text-[var(--reg-gold)]"
        style={{ boxShadow: "0 0 36px rgba(231,181,74,0.22)" }}
      >
        <CheckCircle2 className="h-8 w-8" aria-hidden />
      </div>
      <span className="reg-rise reg-rise-2 mt-4 inline-block text-xs font-semibold uppercase tracking-[0.24em] text-[var(--reg-gold)]">
        Registration received
      </span>
      <h2 className="reg-rise reg-rise-3 mt-2 font-display text-3xl font-bold tracking-tight text-[var(--reg-text)] sm:text-4xl text-balance">
        You're registered, {name.split(" ")[0] || "there"}!
      </h2>
      <p className="reg-rise reg-rise-4 mt-2 text-sm text-[var(--reg-text-2)] sm:text-base">
        Your entry pass has been generated. Save this code or scan the QR at the door:
      </p>

      {/* Prominent code callout */}
      <div className="reg-rise reg-rise-5 mt-5 inline-flex items-center gap-3 rounded-2xl border border-[var(--reg-edge)] bg-[var(--reg-input)] px-6 py-3">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--reg-text-muted)]">
          Pass Code
        </span>
        <span className="font-mono text-2xl font-bold tracking-wider text-[var(--reg-gold)] sm:text-3xl">
          {code}
        </span>
      </div>

      {/* Interactive tear-off ticket with QR */}
      <div className="reg-rise reg-rise-6 mt-8 flex w-full justify-center">
        <TicketPass code={code} name={name} />
      </div>

      <p className="mx-auto mt-6 max-w-md text-xs text-[var(--reg-text-muted)]">
        The organizers will confirm the workshop details with you. Keep this ticket or take a
        screenshot of your pass code.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button
          asChild
          variant="outline"
          className="border-[var(--reg-edge)] bg-transparent text-[var(--reg-text)] hover:bg-[var(--reg-raised-2)] hover:text-[var(--reg-text)]"
        >
          <Link to="/" className="focus-visible:outline-none">
            Back to home
          </Link>
        </Button>
        <button
          onClick={onReset}
          className="reg-cta inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--reg-gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--reg-raised)]"
        >
          Register another student
        </button>
      </div>
    </div>
  );
}
