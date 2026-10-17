import { Link, createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Sparkles,
} from "lucide-react";

import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { TicketPass } from "@/components/bits/ticket-pass";
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
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl px-5 py-16 sm:px-8 md:py-24">
        <Link
          to="/"
          className="mb-10 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        <header className="mb-10">
          <div className="mb-5 flex items-center gap-3">
            <span className="inline-flex h-9 items-center rounded-full border border-gold/30 bg-gold/10 px-3 text-xs font-semibold uppercase tracking-[0.22em] text-gold">
              <Sparkles className="mr-1.5 h-3.5 w-3.5" aria-hidden />
              {EVENT.tagline}
            </span>
          </div>
          <h1 className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl text-balance">
            Register for{" "}
            <span className="bg-gradient-to-r from-gold to-gold-deep bg-clip-text text-transparent">
              {EVENT.name}
            </span>
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground text-pretty">
            Fill in your details to register for the inter-school audio workshop. We confirm your
            spot once your registration is received.
          </p>

          {/* Decorative sound-wave bar — pure CSS, no canvas, respects reduced motion */}
          <div className="mt-8 flex h-10 items-end gap-1 overflow-hidden" aria-hidden>
            {WAVE_BARS.map((h, i) => (
              <span
                key={i}
                className="wave-bar w-1 shrink-0 rounded-full bg-gradient-to-t from-gold/40 to-gold"
                style={{ height: `${h}%`, animationDelay: `${(i % 12) * 90}ms` }}
              />
            ))}
          </div>
        </header>

        <RegisterForm />
      </main>
      <SiteFooter />
    </div>
  );
}

const WAVE_BARS = Array.from({ length: 48 }, (_, i) =>
  Math.round(20 + 60 * Math.abs(Math.sin(i * 0.5)) + 20 * Math.abs(Math.cos(i * 0.3))),
);

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

  function validate(): Partial<Record<FieldKey, string>> {
    const next: Partial<Record<FieldKey, string>> = {};
    for (const f of REG_FIELDS) {
      const v = (values[f.key] ?? "").trim();
      if (f.required && !v) {
        next[f.key] = `${f.label.replace(/\s*\(.*\)/, "")} is required.`;
        continue;
      }
      if (!v) continue;
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

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "submitting") return;
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) {
      setStatus("idle");
      return;
    }
    setStatus("submitting");
    try {
      // Mimic a short network round-trip so the submitting state is real
      // and honest — the actual write happens before success is shown.
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
      if (dup) {
        setStatus("duplicate");
        setCode(record.code);
        return;
      }
      setCode(record.code);
      setStatus("success");
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
        }}
      />
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="relative overflow-hidden rounded-4xl border border-[#e5a710] bg-[#f5b921] px-6 py-8 text-[#0a0a0a] shadow-[0_24px_70px_-20px_rgba(245,185,33,0.5)] sm:px-10 sm:py-10"
    >
      {/* Ambient sheen on the gold panel */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/15 via-transparent to-black/10"
      />
      <div className="relative">
        <div className="mb-7 flex items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-[#0a0a0a] sm:text-3xl">
              Your registration
            </h2>
            <p className="mt-1 text-sm font-medium text-[#0a0a0a]/70">
              All fields marked with <span className="font-semibold">*</span> are required.
            </p>
          </div>
          <span className="hidden shrink-0 rounded-full border border-black/15 bg-black/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#0a0a0a]/70 sm:inline-block">
            {EVENT.name}
          </span>
        </div>

        {status === "duplicate" && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-black/15 bg-black/5 p-4 text-sm">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>
              We may already have a registration under this name or email (code{" "}
              <strong className="font-semibold">{code}</strong>). Your new registration was still
              saved — the organizers will review it.
            </p>
          </div>
        )}

        <div className="grid gap-5 sm:grid-cols-2">
          {REG_FIELDS.map((f) => {
            const isNotes = f.key === "notes";
            const err = errors[f.key];
            return (
              <div key={f.key} className={cn("flex flex-col gap-2", isNotes && "sm:col-span-2")}>
                <label htmlFor={`field-${f.key}`} className="text-sm font-medium text-black/85">
                  {f.label}
                  {f.required && (
                    <span className="ml-1 text-black/50" aria-hidden>
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
                    aria-invalid={!!err}
                    aria-describedby={err ? `${f.key}-error` : undefined}
                    rows={3}
                    className="w-full rounded-lg border border-black/20 bg-white/70 px-3.5 py-2.5 text-sm text-black placeholder:text-black/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-black/40 focus-visible:ring-offset-1 focus-visible:ring-offset-[#f5b921]"
                  />
                ) : (
                  <input
                    id={`field-${f.key}`}
                    name={f.key}
                    type={f.type}
                    inputMode={f.key === "phone" ? "tel" : f.key === "email" ? "email" : "text"}
                    autoComplete={f.key === "email" ? "email" : f.key === "phone" ? "tel" : "name"}
                    value={values[f.key]}
                    maxLength={f.maxLength}
                    onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
                    aria-invalid={!!err}
                    aria-describedby={err ? `${f.key}-error` : undefined}
                    className="w-full rounded-lg border border-black/20 bg-white/70 px-3.5 py-2.5 text-sm text-black placeholder:text-black/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-black/40 focus-visible:ring-offset-1 focus-visible:ring-offset-[#f5b921]"
                  />
                )}
                {f.hint && !err && <p className="text-xs text-black/55">{f.hint}</p>}
                {err && (
                  <p id={`${f.key}-error`} className="text-xs font-medium text-black/80">
                    {err}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-7 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-black/60">
            Your details are only used to manage your registration.
          </p>
          <Button
            type="submit"
            disabled={status === "submitting"}
            className="w-full border border-black/10 bg-black text-white hover:border-black/20 hover:bg-black/85 focus-visible:ring-black/40 sm:w-auto"
          >
            {status === "submitting" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Submitting…
              </>
            ) : (
              <>
                Submit registration
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>

        {status === "error" && (
          <p className="mt-4 text-sm font-medium text-black/85">
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
    <div
      data-reveal
      className="reveal rounded-4xl border border-hairline bg-surface px-6 py-12 text-center sm:px-12"
    >
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-full border border-gold/30 bg-gold/10 text-gold">
        <CheckCircle2 className="h-7 w-7" />
      </div>
      <h2 className="mt-6 font-display text-3xl font-bold tracking-tight text-foreground">
        You're registered, {name.split(" ")[0] || "there"}.
      </h2>
      <p className="mt-3 text-base text-muted-foreground">
        Your registration was saved. Keep this code for your records:
      </p>
      <p className="mt-4 inline-block rounded-xl border border-hairline bg-background px-5 py-2.5 font-display text-2xl font-bold tracking-wider text-gold">
        {code}
      </p>

      <div className="mt-8 w-full">
        <TicketPass code={code} name={name} />
      </div>

      <p className="mt-6 max-w-md mx-auto text-sm text-muted-foreground">
        The organizers will confirm the workshop details with you. This is a demo registration
        stored in your browser — enable Cloud for a real, saved record.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button
          asChild
          variant="outline"
          className="border-border bg-transparent text-foreground hover:bg-surface"
        >
          <Link to="/" className="focus-visible:outline-none">
            Back to home
          </Link>
        </Button>
        <Button
          onClick={onReset}
          className="border border-gold/40 bg-primary text-primary-foreground hover:border-gold/70 hover:bg-secondary focus-visible:ring-gold"
        >
          Register another student
        </Button>
      </div>
    </div>
  );
}
