import type { Member, School } from "@/lib/registration";

/** Sri Lanka time display from a UTC ISO string. */
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

/** Today's date as YYYY-MM-DD for export filenames. */
export function dateStamp() {
  return new Date().toISOString().slice(0, 10);
}

function esc(v: unknown) {
  return `"${String(v ?? "").replace(/"/g, '""')}"`;
}

const MEMBER_HEADER = [
  "member_no",
  "pass_code",
  "full_name",
  "grade",
  "role",
  "school",
  "district",
  "registration_code",
  "status",
  "checked_in_at",
] as const;

/** Serialize members (across schools) to a CSV string. */
export function membersToCsv(schools: School[], filter?: (m: Member) => boolean): string {
  const lines = [MEMBER_HEADER.join(",")];
  for (const s of schools) {
    for (const m of s.members) {
      if (filter ? !filter(m) : false) continue;
      lines.push(
        [
          m.member_no,
          m.pass_code,
          m.full_name,
          m.grade,
          m.role,
          s.name,
          s.district,
          s.registration_code,
          s.status,
          m.checked_in_at ?? "",
        ]
          .map((v) => esc(v))
          .join(","),
      );
    }
  }
  return lines.join("\n");
}

const SCHOOL_HEADER = [
  "registration_code",
  "name",
  "district",
  "teacher_name",
  "status",
  "members",
  "checked_in",
] as const;

/** Serialize a one-row-per-school summary to a CSV string. */
export function schoolsToCsv(schools: School[]): string {
  const lines = [SCHOOL_HEADER.join(",")];
  for (const s of schools) {
    const checkedIn = s.members.filter((m) => m.checked_in_at).length;
    lines.push(
      [
        s.registration_code,
        s.name,
        s.district,
        s.teacher_name,
        s.status,
        s.members.length,
        checkedIn,
      ]
        .map((v) => esc(v))
        .join(","),
    );
  }
  return lines.join("\n");
}

/** Trigger a client-side CSV download. */
export function downloadCsv(name: string, csv: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
