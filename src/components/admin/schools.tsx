import { useMemo, useState } from "react";
import { ChevronDown, Trash2, Users } from "lucide-react";

import {
  deleteSchool,
  formatMemberNo,
  setSchoolStatus,
  type School,
  type SchoolStatus,
} from "@/lib/registration";
import { cn } from "@/lib/utils";
import { CheckBadge, Select, StatusBadge, STATUS_LABEL, fmtUtcLocal } from "./primitives";

export function Schools({
  schools,
  onChanged,
  isAdmin,
}: {
  schools: School[];
  onChanged: () => void;
  isAdmin: boolean;
}) {
  const [q, setQ] = useState("");
  const [status, setStatusFilter] = useState<"all" | SchoolStatus>("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return schools
      .filter((s) => {
        const match =
          !term ||
          s.name.toLowerCase().includes(term) ||
          s.registration_code.toLowerCase().includes(term) ||
          s.teacher_name.toLowerCase().includes(term);
        const statusOk = status === "all" || s.status === status;
        return match && statusOk;
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [schools, q, status]);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">Schools</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {filtered.length} school{filtered.length === 1 ? "" : "s"}. Review, confirm or cancel a
          school registration; expand to see its team.
        </p>
      </div>

      <div className="grid gap-3 rounded-2xl border border-hairline bg-surface p-4 sm:grid-cols-2 lg:grid-cols-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search school, code or teacher"
          aria-label="Search schools"
          className="rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:col-span-2"
        />
        <Select
          label="Status filter"
          value={status}
          onChange={(v) => setStatusFilter(v as "all" | SchoolStatus)}
          options={[
            { value: "all", label: "Any status" },
            { value: "confirmed", label: "Confirmed" },
            { value: "needs_review", label: "Needs review" },
            { value: "cancelled", label: "Cancelled" },
          ]}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-hairline bg-surface/40 p-10 text-center text-sm text-muted-foreground">
          No schools match these filters.
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {filtered.map((s) => {
            const open = openId === s.id;
            const here = s.members.filter((m) => m.checked_in_at).length;
            return (
              <li key={s.id} className="rounded-2xl border border-hairline bg-surface">
                <button
                  type="button"
                  onClick={() => setOpenId(open ? null : s.id)}
                  aria-expanded={open}
                  className="flex w-full items-center justify-between gap-4 p-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-medium text-foreground">{s.name}</p>
                      <StatusBadge status={s.status} />
                    </div>
                    <p className="mt-1 truncate text-xs text-muted-foreground">
                      {s.registration_code} · {s.teacher_name || "No teacher named"}
                      {s.district ? ` · ${s.district}` : ""}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-4">
                    <span className="hidden items-center gap-1.5 text-xs text-muted-foreground sm:flex">
                      <Users className="h-3.5 w-3.5" aria-hidden />
                      {here}/{s.members.length}
                    </span>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 text-muted-foreground transition-transform",
                        open && "rotate-180",
                      )}
                      aria-hidden
                    />
                  </div>
                </button>

                {open && (
                  <div className="border-t border-hairline p-5">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Team ({s.members.length})
                    </p>
                    <ul className="mt-3 flex flex-col gap-2">
                      {s.members
                        .slice()
                        .sort((a, b) => a.member_no - b.member_no)
                        .map((m) => (
                          <li
                            key={m.id}
                            className="flex items-center justify-between gap-3 text-sm"
                          >
                            <span className="flex items-center gap-2">
                              <span className="font-mono text-xs text-muted-foreground">
                                #{formatMemberNo(m.member_no)}
                              </span>
                              <span className="text-foreground">{m.full_name}</span>
                              <span className="text-xs text-muted-foreground">
                                {m.role === "teacher" ? "Teacher" : m.grade || "Student"}
                              </span>
                            </span>
                            <span className="flex items-center gap-2">
                              {m.checked_in_at && (
                                <span className="text-xs text-muted-foreground">
                                  {fmtUtcLocal(m.checked_in_at)}
                                </span>
                              )}
                              <CheckBadge checkedIn={!!m.checked_in_at} />
                            </span>
                          </li>
                        ))}
                    </ul>

                    {isAdmin && (
                      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-hairline pt-4">
                        <div className="flex flex-wrap gap-2">
                          {(["confirmed", "needs_review", "cancelled"] as SchoolStatus[]).map(
                            (st) => (
                              <button
                                key={st}
                                onClick={() => {
                                  setSchoolStatus(s.id, st);
                                  onChanged();
                                }}
                                className={cn(
                                  "rounded-md border px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                                  s.status === st
                                    ? "border-gold/50 bg-gold/10 text-gold"
                                    : "border-border text-muted-foreground hover:text-foreground",
                                )}
                              >
                                {STATUS_LABEL[st]}
                              </button>
                            ),
                          )}
                        </div>
                        {confirmDelete === s.id ? (
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                              Delete this school?
                            </span>
                            <button
                              onClick={() => {
                                deleteSchool(s.id);
                                onChanged();
                                setConfirmDelete(null);
                                setOpenId(null);
                              }}
                              className="rounded-md bg-destructive px-3 py-1.5 text-xs font-medium text-destructive-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                              Confirm delete
                            </button>
                            <button
                              onClick={() => setConfirmDelete(null)}
                              className="text-xs text-muted-foreground hover:text-foreground"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDelete(s.id)}
                            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                          >
                            <Trash2 className="h-3.5 w-3.5" /> Delete
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
