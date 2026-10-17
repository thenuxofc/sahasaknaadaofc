import { useMemo, useState } from "react";
import { Undo2 } from "lucide-react";

import { checkIn, undoCheckIn, type Registration } from "@/lib/registration";
import { fmtUtcLocal, DemoTag } from "./primitives";

export function CheckIn({
  rows,
  staff,
  onChanged,
}: {
  rows: Registration[];
  staff: string;
  onChanged: () => void;
}) {
  const [q, setQ] = useState("");
  const [done, setDone] = useState<{ name: string; time: string } | null>(null);

  const matches = useMemo(() => {
    const norm = (s: string) => s.trim().toLowerCase();
    const term = norm(q);
    if (!term) return [];
    return rows
      .filter(
        (r) =>
          r.status !== "Cancelled" &&
          (norm(r.fullName).includes(term) ||
            norm(r.code).includes(term) ||
            norm(r.school).includes(term) ||
            norm(r.email).includes(term)),
      )
      .slice(0, 6);
  }, [q, rows]);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">Check-in</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Search by name, registration code, school or email.
        </p>
      </div>

      <input
        autoFocus
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Start typing a name or code…"
        aria-label="Search for a participant to check in"
        className="w-full rounded-xl border border-border bg-surface px-5 py-4 text-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
      />

      {done && (
        <div className="rounded-xl border border-gold/40 bg-gold/10 p-4 text-sm text-foreground">
          Checked in <strong>{done.name}</strong> at {done.time}.
        </div>
      )}

      {q && matches.length === 0 && (
        <p className="rounded-xl border border-dashed border-hairline p-6 text-center text-sm text-muted-foreground">
          No matching registrations.
        </p>
      )}

      <div className="flex flex-col gap-3">
        {matches.map((r) => (
          <div
            key={r.id}
            className="flex flex-col gap-3 rounded-2xl border border-hairline bg-surface p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="font-semibold text-foreground">
                {r.fullName} {r.isDemo && <DemoTag />}
              </p>
              <p className="text-sm text-muted-foreground">
                {r.school} · {r.code} · {r.grade}
              </p>
            </div>
            {r.attendance === "Checked in" ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gold">
                  Already checked in
                  {r.checkedInAt ? ` · ${fmtUtcLocal(r.checkedInAt)}` : ""}
                </span>
                <button
                  onClick={() => {
                    undoCheckIn(r.id);
                    onChanged();
                  }}
                  className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs font-medium hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Undo2 className="h-3.5 w-3.5" /> Undo
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  const rec = checkIn(r.id, staff);
                  if (rec) {
                    setDone({
                      name: r.fullName,
                      time: fmtUtcLocal(rec.checkedInAt ?? new Date().toISOString()),
                    });
                    onChanged();
                  }
                }}
                className="inline-flex items-center gap-2 rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-gold-foreground hover:bg-gold-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/40"
              >
                <span aria-hidden>✓</span> Check in
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
