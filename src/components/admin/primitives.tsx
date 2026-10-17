import { useState } from "react";

import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";
import type { Registration, RegistrationStatus } from "@/lib/registration";

export type SortKey = "name" | "school" | "date" | "status" | "checkin";
export type Tab = "overview" | "registrations" | "checkin" | "export";

export function fmtUtcLocal(iso: string) {
  try {
    return new Date(iso).toLocaleString("en-GB", {
      timeZone: "Asia/Colombo",
      hour12: false,
    });
  } catch {
    return iso;
  }
}

/* ---------------- Top bar + tabs ---------------- */

export function AdminTopBar({
  staff,
  onSignOut,
}: {
  staff: string;
  onSignOut: () => void;
}) {
  return (
    <div className="sticky top-0 z-40 border-b border-hairline bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5 sm:px-8">
        <Logo />
        <div className="flex items-center gap-4">
          <span className="hidden text-sm text-muted-foreground sm:inline">
            Signed in as{" "}
            <strong className="font-medium text-foreground">{staff}</strong>
          </span>
          <button
            onClick={onSignOut}
            className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span aria-hidden>↗</span> Sign out
          </button>
        </div>
      </div>
    </div>
  );
}

export function Tabs({
  tab,
  setTab,
}: {
  tab: Tab;
  setTab: (t: Tab) => void;
}) {
  const items: { id: Tab; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "registrations", label: "Registrations" },
    { id: "checkin", label: "Check-in" },
    { id: "export", label: "Reports & Export" },
  ];
  return (
    <div
      role="tablist"
      aria-label="Dashboard sections"
      className="flex flex-wrap gap-1 border-b border-hairline"
    >
      {items.map((it) => (
        <button
          key={it.id}
          role="tab"
          aria-selected={tab === it.id}
          onClick={() => setTab(it.id)}
          className={cn(
            "rounded-t-md px-4 py-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            tab === it.id
              ? "border-b-2 border-gold text-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {it.label}
        </button>
      ))}
    </div>
  );
}

/* ---------------- Small shared UI ---------------- */

export function StatusBadge({ status }: { status: RegistrationStatus }) {
  const map: Record<RegistrationStatus, string> = {
    Submitted: "text-foreground/80",
    Confirmed: "text-gold",
    "Needs review": "text-amber-400",
    Cancelled: "text-muted-foreground line-through",
  };
  return <span className={cn("text-xs font-medium", map[status])}>{status}</span>;
}

export function CheckBadge({
  attendance,
}: {
  attendance: Registration["attendance"];
}) {
  const isIn = attendance === "Checked in";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        isIn
          ? "border-gold/40 text-gold"
          : "border-hairline text-muted-foreground",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          isIn ? "bg-gold" : "bg-muted-foreground/50",
        )}
      />
      {isIn ? "Checked in" : "Not checked in"}
    </span>
  );
}

export function DemoTag() {
  return (
    <span className="rounded-full border border-hairline px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
      demo
    </span>
  );
}

export function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 text-foreground">{value}</dd>
    </div>
  );
}

export function Select({
  value,
  onChange,
  options,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  label?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      {label && (
        <span className="sr-only">{label}</span>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function Th({
  label,
  k,
  sort,
  onSort,
}: {
  label: string;
  k: SortKey;
  sort: { key: SortKey; dir: 1 | -1 };
  onSort: (k: SortKey) => void;
}) {
  return (
    <th className="px-4 py-3">
      <button
        onClick={() => onSort(k)}
        className="inline-flex items-center gap-1 font-medium uppercase tracking-wide hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
      >
        {label}
        <span
          aria-hidden
          className={cn(
            "text-[10px]",
            sort.key === k ? "text-gold" : "text-muted-foreground/60",
          )}
        >
          {sort.key === k ? (sort.dir === 1 ? "▲" : "▼") : "↕"}
        </span>
      </button>
    </th>
  );
}
