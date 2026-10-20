import { formatMemberNo, type School } from "@/lib/registration";

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

const CSV_HEADER = [
  "pass_number",
  "pass_code",
  "member_name",
  "role",
  "grade",
  "school",
  "district",
  "school_code",
  "school_status",
  "teacher_in_charge",
  "contact_phone",
  "contact_email",
  "checked_in",
  "checked_in_at",
  "registered_at",
] as const;

function esc(v: unknown) {
  // Prefix cells that spreadsheets would treat as formulas (CSV injection).
  const s = String(v ?? "");
  const safe = /^[=+\-@\t\r]/.test(s) ? `'${s}` : s;
  return `"${safe.replace(/"/g, '""')}"`;
}

/** One CSV row per team member, with their school's details alongside. */
export function membersToCsv(schools: School[], only?: (checkedIn: boolean) => boolean): string {
  const lines: string[] = [CSV_HEADER.join(",")];
  for (const s of schools) {
    for (const m of [...s.members].sort((a, b) => a.member_no - b.member_no)) {
      const checkedIn = m.checked_in_at !== null;
      if (only && !only(checkedIn)) continue;
      lines.push(
        [
          formatMemberNo(m.member_no),
          m.pass_code,
          m.full_name,
          m.role,
          m.grade ?? "",
          s.name,
          s.district,
          s.registration_code,
          s.status,
          s.teacher_name,
          s.contact_phone,
          s.contact_email,
          checkedIn ? "yes" : "no",
          m.checked_in_at ?? "",
          m.created_at,
        ]
          .map((v) => esc(v))
          .join(","),
      );
    }
  }
  return lines.join("\n");
}

const SCHOOL_HEADER = [
  "school_code",
  "school",
  "district",
  "teacher_in_charge",
  "contact_phone",
  "contact_email",
  "status",
  "members",
  "checked_in",
  "registered_at",
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
        s.contact_phone,
        s.contact_email,
        s.status,
        s.members.length,
        checkedIn,
        s.created_at,
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
