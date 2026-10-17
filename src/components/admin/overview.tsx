import { useMemo } from "react";
import { CheckCircle2, Clock, Users, XCircle } from "lucide-react";

import type { Registration } from "@/lib/registration";
import { fmtUtcLocal } from "./primitives";

export function Overview({ rows }: { rows: Registration[] }) {
  const real = rows.filter((r) => !r.isDemo);
  const demo = rows.filter((r) => r.isDemo);
  const checked = rows.filter((r) => r.attendance === "Checked in").length;
  const notArrived = rows.filter((r) => r.attendance === "Not checked in").length;
  const cancelled = rows.filter((r) => r.status === "Cancelled").length;
  const rate = rows.length ? Math.round((checked / rows.length) * 100) : 0;

  const bySchool = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of rows) map.set(r.school, (map.get(r.school) ?? 0) + 1);
    return [...map.entries()].sort((a, b) => b[1] - a[1]);
  }, [rows]);

  const metrics = [
    { label: "Total registrations", value: rows.length, icon: Users },
    { label: "Checked in", value: checked, icon: CheckCircle2 },
    { label: "Not yet arrived", value: notArrived, icon: Clock },
    { label: "Cancelled", value: cancelled, icon: XCircle },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">Overview</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Metrics derive from stored records only. {real.length} real · {demo.length} demo records.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {metrics.map((m) => (
          <div key={m.label} className="rounded-2xl border border-hairline bg-surface p-5">
            <m.icon className="h-5 w-5 text-gold" />
            <p className="mt-4 font-display text-3xl font-bold tabular-nums">{m.value}</p>
            <p className="mt-1 text-sm text-muted-foreground">{m.label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-hairline bg-surface p-6">
          <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Attendance rate
          </h2>
          <p className="mt-3 font-display text-5xl font-bold text-gold">{rate}%</p>
          <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-hairline">
            <div
              className="h-full rounded-full bg-gold transition-all"
              style={{ width: `${rate}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {checked} of {rows.length} checked in
          </p>
        </div>

        <div className="rounded-2xl border border-hairline bg-surface p-6">
          <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Registrations by school
          </h2>
          {bySchool.length === 0 ? (
            <p className="mt-6 text-sm text-muted-foreground">No registrations yet.</p>
          ) : (
            <ul className="mt-4 flex flex-col gap-3">
              {bySchool.map(([school, count]) => (
                <li key={school} className="flex items-center justify-between gap-4 text-sm">
                  <span className="truncate text-foreground">{school}</span>
                  <span className="shrink-0 rounded-full border border-hairline px-2.5 py-0.5 text-xs font-medium text-muted-foreground tabular-nums">
                    {count}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <p className="text-xs text-muted-foreground" aria-hidden>
        {fmtUtcLocal(new Date().toISOString())}
      </p>
    </div>
  );
}
