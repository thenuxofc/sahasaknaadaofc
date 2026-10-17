import { useEffect, useMemo, useState } from "react";
import { Undo2, Trash2 } from "lucide-react";

import {
  deleteRegistration,
  listRegistrations,
  setStatus,
  undoCheckIn,
  checkIn,
  type Registration,
  type RegistrationStatus,
} from "@/lib/registration";
import { cn } from "@/lib/utils";
import {
  CheckBadge,
  DemoTag,
  Field,
  Select,
  StatusBadge,
  Th,
  fmtUtcLocal,
  type SortKey,
} from "./primitives";

export function Registrations({
  rows,
  staff,
  onChanged,
}: {
  rows: Registration[];
  staff: string;
  onChanged: () => void;
}) {
  const [q, setQ] = useState("");
  const [school, setSchool] = useState("all");
  const [status, setStatusFilter] = useState<"all" | RegistrationStatus>("all");
  const [checkin, setCheckin] = useState<"all" | "in" | "out">("all");
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({
    key: "date",
    dir: -1,
  });
  const [page, setPage] = useState(0);
  const [detail, setDetail] = useState<Registration | null>(null);
  const PAGE = 8;

  const schools = useMemo(() => [...new Set(rows.map((r) => r.school))].sort(), [rows]);

  const filtered = useMemo(() => {
    const norm = (s: string) => s.trim().toLowerCase();
    const term = norm(q);
    return rows
      .filter((r) => {
        const matches =
          !term ||
          norm(r.fullName).includes(term) ||
          norm(r.code).includes(term) ||
          norm(r.school).includes(term) ||
          norm(r.email).includes(term);
        const schoolOk = school === "all" || r.school === school;
        const statusOk = status === "all" || r.status === status;
        const checkOk =
          checkin === "all" ||
          (checkin === "in" && r.attendance === "Checked in") ||
          (checkin === "out" && r.attendance === "Not checked in");
        return matches && schoolOk && statusOk && checkOk;
      })
      .sort((a, b) => {
        let cmp = 0;
        switch (sort.key) {
          case "name":
            cmp = a.fullName.localeCompare(b.fullName);
            break;
          case "school":
            cmp = a.school.localeCompare(b.school);
            break;
          case "date":
            cmp = a.createdAt.localeCompare(b.createdAt);
            break;
          case "status":
            cmp = a.status.localeCompare(b.status);
            break;
          case "checkin":
            cmp = a.attendance.localeCompare(b.attendance);
            break;
        }
        return cmp * sort.dir;
      });
  }, [rows, q, school, status, checkin, sort]);

  const pageRows = filtered.slice(page * PAGE, page * PAGE + PAGE);
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE));

  useEffect(() => setPage(0), [q, school, status, checkin, sort]);

  function toggleSort(key: SortKey) {
    setSort((s) => (s.key === key ? { key, dir: (s.dir * -1) as 1 | -1 } : { key, dir: 1 }));
  }

  function resetFilters() {
    setQ("");
    setSchool("all");
    setStatusFilter("all");
    setCheckin("all");
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">Registrations</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {filtered.length} match{filtered.length === 1 ? "" : "es"} · search, sort and filters
          apply across the full dataset.
        </p>
      </div>

      <div className="grid gap-3 rounded-2xl border border-hairline bg-surface p-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="relative lg:col-span-2">
          <Search />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name, code, school, email"
            aria-label="Search registrations"
            className="w-full rounded-lg border border-border bg-background py-2.5 pl-9 pr-3 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <Select
          label="School filter"
          value={school}
          onChange={setSchool}
          options={[
            { value: "all", label: "All schools" },
            ...schools.map((s) => ({ value: s, label: s })),
          ]}
        />
        <Select
          label="Status filter"
          value={status}
          onChange={(v) => setStatusFilter(v as "all" | RegistrationStatus)}
          options={[
            { value: "all", label: "Any status" },
            { value: "Submitted", label: "Submitted" },
            { value: "Confirmed", label: "Confirmed" },
            { value: "Needs review", label: "Needs review" },
            { value: "Cancelled", label: "Cancelled" },
          ]}
        />
        <Select
          label="Check-in filter"
          value={checkin}
          onChange={(v) => setCheckin(v as "all" | "in" | "out")}
          options={[
            { value: "all", label: "Any check-in" },
            { value: "in", label: "Checked in" },
            { value: "out", label: "Not checked in" },
          ]}
        />
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          Sorted by {sort.key} ({sort.dir === 1 ? "asc" : "desc"})
        </p>
        <button
          onClick={resetFilters}
          className="text-xs font-medium text-gold hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
        >
          Reset filters
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-hairline bg-surface/40 p-10 text-center text-sm text-muted-foreground">
          No registrations match these filters.
        </div>
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-2xl border border-hairline md:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <Th label="Name" k="name" sort={sort} onSort={toggleSort} />
                  <Th label="School" k="school" sort={sort} onSort={toggleSort} />
                  <Th label="Status" k="status" sort={sort} onSort={toggleSort} />
                  <Th label="Check-in" k="checkin" sort={sort} onSort={toggleSort} />
                  <Th label="Submitted" k="date" sort={sort} onSort={toggleSort} />
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {pageRows.map((r) => (
                  <tr key={r.id} className="transition-colors hover:bg-surface/60">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground">{r.fullName}</span>
                        {r.isDemo && <DemoTag />}
                      </div>
                      <span className="text-xs text-muted-foreground">{r.code}</span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{r.school}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="px-4 py-3">
                      <CheckBadge attendance={r.attendance} />
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {fmtUtcLocal(r.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setDetail(r)}
                        className="rounded-md px-2 py-1 text-xs font-medium text-gold hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        Open
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-3 md:hidden">
            {pageRows.map((r) => (
              <button
                key={r.id}
                onClick={() => setDetail(r)}
                className="rounded-2xl border border-hairline bg-surface p-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-foreground">{r.fullName}</span>
                  {r.isDemo && <DemoTag />}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {r.code} · {r.school}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <StatusBadge status={r.status} />
                  <CheckBadge attendance={r.attendance} />
                </div>
              </button>
            ))}
          </div>

          {pages > 1 && (
            <div className="flex items-center justify-between">
              <button
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                className="rounded-md border border-border px-3 py-1.5 text-sm disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Prev
              </button>
              <span className="text-xs text-muted-foreground">
                Page {page + 1} of {pages}
              </span>
              <button
                disabled={page >= pages - 1}
                onClick={() => setPage((p) => Math.min(pages - 1, p + 1))}
                className="rounded-md border border-border px-3 py-1.5 text-sm disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {detail && (
        <DetailPanel
          row={detail}
          staff={staff}
          onClose={() => setDetail(null)}
          onChanged={() => {
            onChanged();
            setDetail((d) => (d ? (listRegistrations().find((r) => r.id === d.id) ?? null) : null));
          }}
        />
      )}
    </div>
  );
}

function Search() {
  return (
    <svg
      className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function DetailPanel({
  row,
  staff,
  onClose,
  onChanged,
}: {
  row: Registration;
  staff: string;
  onClose: () => void;
  onChanged: () => void;
}) {
  const [note, setNote] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Registration detail: ${row.fullName}`}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 sm:items-center sm:p-6"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-hairline bg-surface p-6 sm:rounded-3xl sm:p-8"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs text-muted-foreground">{row.code}</p>
            <h2 className="mt-1 font-display text-2xl font-bold">{row.fullName}</h2>
            {row.isDemo && <DemoTag />}
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-md p-2 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            ✕
          </button>
        </div>

        <dl className="mt-6 grid grid-cols-2 gap-x-4 gap-y-4 text-sm">
          <Field label="School" value={row.school} />
          <Field label="Grade / year" value={row.grade} />
          <Field label="Email" value={row.email} />
          <Field label="Phone" value={row.phone} />
          <Field label="Notes" value={row.notes || "—"} />
          <Field label="Submitted" value={fmtUtcLocal(row.createdAt)} />
        </dl>

        <div className="mt-6 rounded-xl border border-hairline bg-background p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Status</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {(["Submitted", "Confirmed", "Needs review", "Cancelled"] as RegistrationStatus[]).map(
              (s) => (
                <button
                  key={s}
                  onClick={() => {
                    setStatus(row.id, s);
                    onChanged();
                  }}
                  className={cn(
                    "rounded-md border px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    row.status === s
                      ? "border-gold/50 bg-gold/10 text-gold"
                      : "border-border text-muted-foreground hover:text-foreground",
                  )}
                >
                  {s}
                </button>
              ),
            )}
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-hairline bg-background p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Check-in</p>
          {row.attendance === "Checked in" ? (
            <div className="mt-3 flex items-center justify-between gap-4">
              <p className="text-sm text-foreground">
                Checked in {row.checkedInAt ? fmtUtcLocal(row.checkedInAt) : ""} by{" "}
                {row.checkedInBy ?? "—"}
              </p>
              <button
                onClick={() => {
                  undoCheckIn(row.id);
                  onChanged();
                }}
                className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs font-medium hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Undo2 className="h-3.5 w-3.5" /> Undo
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                checkIn(row.id, staff);
                onChanged();
              }}
              className="mt-3 inline-flex items-center gap-2 rounded-md bg-gold px-4 py-2 text-sm font-semibold text-gold-foreground hover:bg-gold-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/40"
            >
              <span aria-hidden>✓</span> Check in
            </button>
          )}
        </div>

        <div className="mt-4 rounded-xl border border-hairline bg-background p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Internal notes</p>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Private organizer notes (not shown to participants)…"
            rows={3}
            className="mt-2 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <p className="mt-1 text-[11px] text-muted-foreground">
            Notes are kept separate from submitted participant fields.
          </p>
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-hairline pt-5">
          {confirmDelete ? (
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs text-muted-foreground">Delete this record?</span>
              <button
                onClick={() => {
                  deleteRegistration(row.id);
                  onChanged();
                  onClose();
                }}
                className="rounded-md bg-destructive px-3 py-1.5 text-xs font-medium text-destructive-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Confirm delete
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
            >
              <Trash2 className="h-3.5 w-3.5" /> Delete record
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
