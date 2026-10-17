import type { Registration } from "@/lib/registration";

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
  "code",
  "fullName",
  "school",
  "grade",
  "email",
  "phone",
  "status",
  "attendance",
  "createdAt",
  "checkedInAt",
  "checkedInBy",
  "isDemo",
] as const;

function esc(v: string) {
  return `"${String(v).replace(/"/g, '""')}"`;
}

/** Serialize registrations to a CSV string. */
export function toCsv(rows: Registration[]): string {
  const lines = [CSV_HEADER.join(",")];
  for (const r of rows) {
    lines.push(
      [
        r.code,
        r.fullName,
        r.school,
        r.grade,
        r.email,
        r.phone,
        r.status,
        r.attendance,
        r.createdAt,
        r.checkedInAt ?? "",
        r.checkedInBy ?? "",
        r.isDemo ? "demo" : "real",
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
