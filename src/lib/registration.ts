/*
 * Sahasaknaada — registration demo store.
 *
 * DEMO ONLY: Cloud is not enabled on this project, so registrations persist in
 * the browser (localStorage). This is clearly labelled demo data — it is NOT
 * a secure backend and is not private. The public admin route cannot be truly
 * secured without a real backend; see the note at the bottom of this file.
 */

export type RegistrationStatus = "Submitted" | "Confirmed" | "Needs review" | "Cancelled";

export type AttendanceStatus = "Not checked in" | "Checked in";

export type Registration = {
  id: string; // internal id
  code: string; // public registration code
  fullName: string;
  school: string;
  grade: string;
  email: string;
  phone: string;
  notes: string;
  createdAt: string; // ISO UTC
  status: RegistrationStatus;
  attendance: AttendanceStatus;
  checkedInAt: string | null; // ISO UTC
  checkedInBy: string | null;
  isDemo: boolean;
};

export type RegistrationInput = {
  fullName: string;
  school: string;
  grade: string;
  email: string;
  phone: string;
  notes: string;
};

const KEY = "sahasaknaada:registrations";

function readAll(): Registration[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Registration[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(rows: Registration[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(rows));
  // Notify same-tab listeners.
  window.dispatchEvent(new CustomEvent("sahasaknaada:registrations-updated"));
}

function makeId() {
  // crypto.randomUUID is available in modern browsers and the preview runtime.
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return "id-" + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function makeCode() {
  // Public-facing registration code: SSA-XXXXXX
  const n = Math.floor(Math.random() * 0xffffff)
    .toString(16)
    .toUpperCase()
    .padStart(6, "0");
  return `SSA-${n}`;
}

export function addRegistration(input: RegistrationInput): { ok: true; record: Registration } {
  const record: Registration = {
    id: makeId(),
    code: makeCode(),
    fullName: input.fullName.trim(),
    school: input.school.trim(),
    grade: input.grade.trim(),
    email: input.email.trim(),
    phone: input.phone.trim(),
    notes: input.notes.trim(),
    createdAt: new Date().toISOString(),
    status: "Submitted",
    attendance: "Not checked in",
    checkedInAt: null,
    checkedInBy: null,
    isDemo: false,
  };
  const rows = readAll();
  rows.unshift(record);
  writeAll(rows);
  return { ok: true, record };
}

export function listRegistrations(): Registration[] {
  return readAll();
}

export function findLikelyDuplicate(input: RegistrationInput, existing: Registration[]): boolean {
  const norm = (s: string) => s.trim().toLowerCase().replace(/\s+/g, " ");
  const name = norm(input.fullName);
  const email = norm(input.email);
  if (!name) return false;
  return existing.some((r) => norm(r.email) === email || norm(r.fullName) === name);
}

export function setStatus(id: string, status: RegistrationStatus) {
  const rows = readAll();
  const idx = rows.findIndex((r) => r.id === id);
  if (idx === -1) return;
  const current = rows[idx];
  if (!current) return;
  rows[idx] = { ...current, status };
  writeAll(rows);
}

export function checkIn(id: string, staff: string) {
  const rows = readAll();
  const idx = rows.findIndex((r) => r.id === id);
  if (idx === -1) return null;
  const current = rows[idx];
  if (!current) return null;
  if (current.attendance === "Checked in") return current;
  const updated: Registration = {
    ...current,
    attendance: "Checked in",
    checkedInAt: new Date().toISOString(),
    checkedInBy: staff,
  };
  rows[idx] = updated;
  writeAll(rows);
  return updated;
}

export function undoCheckIn(id: string) {
  const rows = readAll();
  const idx = rows.findIndex((r) => r.id === id);
  if (idx === -1) return;
  const current = rows[idx];
  if (!current) return;
  rows[idx] = {
    ...current,
    attendance: "Not checked in",
    checkedInAt: null,
    checkedInBy: null,
  };
  writeAll(rows);
}

export function deleteRegistration(id: string) {
  const rows = readAll().filter((r) => r.id !== id);
  writeAll(rows);
}

export function seedDemoData(staff: string) {
  const rows = readAll();
  if (rows.some((r) => r.isDemo)) return;
  const demos: Omit<Registration, "id" | "code">[] = [
    {
      fullName: "Aarav Perera",
      school: "Royal College Colombo",
      grade: "Grade 11",
      email: "demo.1@example.com",
      phone: "0770000001",
      notes: "",
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      status: "Confirmed",
      attendance: "Not checked in",
      checkedInAt: null,
      checkedInBy: null,
      isDemo: true,
    },
    {
      fullName: "Dinithi Fernando",
      school: "Visakha Vidyalaya",
      grade: "Grade 12",
      email: "demo.2@example.com",
      phone: "0770000002",
      notes: "Interested in podcasting.",
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      status: "Submitted",
      attendance: "Checked in",
      checkedInAt: new Date(Date.now() - 3600000).toISOString(),
      checkedInBy: staff,
      isDemo: true,
    },
    {
      fullName: "Sahan Wickrama",
      school: "Ananda College",
      grade: "Grade 10",
      email: "demo.3@example.com",
      phone: "0770000003",
      notes: "",
      createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
      status: "Needs review",
      attendance: "Not checked in",
      checkedInAt: null,
      checkedInBy: null,
      isDemo: true,
    },
  ];
  writeAll([
    ...demos.map<Registration>((d) => ({
      ...d,
      id: makeId(),
      code: makeCode(),
    })),
    ...rows,
  ]);
}

export function clearDemoData() {
  const rows = readAll().filter((r) => !r.isDemo);
  writeAll(rows);
}

/*
 * SECURITY NOTE (until Cloud is enabled):
 * There is no real server-side authorization here. The /admin route is gated
 * by a labelled demo sign-in kept in sessionStorage. Do NOT treat demo
 * registrations as private or production-safe. Enabling Cloud adds real
 * authenticated organizer accounts, a persistent database, and RLS so only
 * signed-in organizers can read or change registration data.
 */
