import { useState } from "react";
import { Download, Loader2 } from "lucide-react";

import { seedDemoData, clearDemoData, type Registration } from "@/lib/registration";
import { dateStamp, downloadCsv, toCsv } from "@/lib/admin-helpers";

export function ExportPanel({ rows, onReset }: { rows: Registration[]; onReset: () => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function run(label: string, subset: Registration[], file: string) {
    setError(null);
    if (subset.length === 0) {
      setError(`No records for "${label}".`);
      return;
    }
    setBusy(true);
    try {
      downloadCsv(file, toCsv(subset));
    } catch {
      setError("Export failed — please try again.");
    } finally {
      setBusy(false);
    }
  }

  const all = rows;
  const checkedIn = rows.filter((r) => r.attendance === "Checked in");
  const notArrived = rows.filter((r) => r.attendance === "Not checked in");
  const schools = [...new Set(rows.map((r) => r.school))].sort();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">Reports &amp; Export</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          CSV exports from stored records. Filenames include today's date.
          {rows.some((r) => r.isDemo) && " Demo records are labelled in the CSV."}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <ExportCard
          title="All registrations"
          count={all.length}
          onClick={() => run("all", all, `sahasaknaada-registrations-${dateStamp()}.csv`)}
        />
        <ExportCard
          title="Attendance list"
          count={checkedIn.length}
          onClick={() => run("checked in", checkedIn, `sahasaknaada-attendance-${dateStamp()}.csv`)}
        />
        <ExportCard
          title="Not yet arrived"
          count={notArrived.length}
          onClick={() =>
            run("not arrived", notArrived, `sahasaknaada-not-arrived-${dateStamp()}.csv`)
          }
        />
        {schools.map((s) => {
          const subset = rows.filter((r) => r.school === s);
          const slug = s
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "");
          return (
            <ExportCard
              key={s}
              title={s}
              count={subset.length}
              onClick={() => run(s, subset, `sahasaknaada-${slug}-${dateStamp()}.csv`)}
            />
          );
        })}
      </div>

      {busy && (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Preparing export…
        </p>
      )}
      {error && (
        <p className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive-foreground">
          {error}
        </p>
      )}

      <div className="rounded-2xl border border-hairline bg-surface p-5">
        <h2 className="text-sm font-medium">Demo data</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Seed or clear labelled demo records so the dashboard isn't empty during testing.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            onClick={() => {
              seedDemoData("Organizer");
              onReset();
            }}
            className="rounded-md border border-border px-3 py-1.5 text-xs font-medium hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Seed demo data
          </button>
          <button
            onClick={() => {
              clearDemoData();
              onReset();
            }}
            className="rounded-md border border-border px-3 py-1.5 text-xs font-medium hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Clear demo data
          </button>
        </div>
      </div>
    </div>
  );
}

function ExportCard({
  title,
  count,
  onClick,
}: {
  title: string;
  count: number;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={count === 0}
      className="flex items-center justify-between gap-4 rounded-2xl border border-hairline bg-surface p-5 text-left transition-colors hover:border-gold/40 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div>
        <p className="font-medium text-foreground">{title}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {count} record{count === 1 ? "" : "s"}
        </p>
      </div>
      <span className="grid h-9 w-9 place-items-center rounded-full border border-border text-gold">
        <Download className="h-4 w-4" />
      </span>
    </button>
  );
}
