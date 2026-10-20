/*
 * Sahasaknaada — registration store (schools + members).
 *
 * DEMO ONLY: Cloud is not enabled on this project, so registrations persist in
 * the browser (localStorage). This is clearly labelled demo data — it is NOT
 * a secure backend and is not private. The public admin route cannot be truly
 * secured without a real backend; see the note at the bottom of this file.
 */

/* ------------------------------- Types --------------------------------- */

export type SchoolStatus = "confirmed" | "needs_review" | "cancelled";
export type MemberRole = "teacher" | "student";

export type Member = {
  id: string;
  member_no: number; // sequential within the school, from 1
  pass_code: string; // what the QR / pass encodes
  full_name: string;
  grade: string;
  role: MemberRole;
  email?: string;
  phone?: string;
  notes?: string;
  checked_in_at: string | null; // ISO UTC
};

export type School = {
  id: string;
  name: string;
  district: string;
  registration_code: string; // school-level public code
  status: SchoolStatus;
  teacher_name: string;
  created_at: string; // ISO UTC
  members: Member[];
};

export type MemberCard = {
  member: Member;
  school: School;
  team: Member[]; // all members of the school (fresh)
};

export type CheckInResult =
  | { result: "checked_in"; card: MemberCard }
  | { result: "already_checked_in"; card: MemberCard }
  | { result: "school_cancelled"; card: MemberCard }
  | { result: "not_found" };

export type UndoResult = { result: "undone"; card: MemberCard } | { result: "not_found" };

export type StaffProfile = {
  display_name: string;
  role: "admin" | "desk";
};

export type SchoolPass = {
  member_no: number;
  pass_code: string;
  full_name: string;
  grade: string;
  role: MemberRole;
};

export type SchoolPasses = {
  school: {
    id: string;
    name: string;
    district: string;
    registration_code: string;
    status: SchoolStatus;
    teacher_name: string;
  };
  members: SchoolPass[];
};

export type EventSettings = {
  registration_open: boolean;
  max_members_per_school: number;
};

/* ---------------------- Backward-compat (register.tsx) ------------------ */
/*
 * The public register form still uses the per-person Registration shape. These
 * types and helpers are thin projections over the schools/members store so the
 * register page keeps working while the organizer dashboard speaks in schools.
 */

export type RegistrationStatus = "Submitted" | "Confirmed" | "Needs review" | "Cancelled";
export type AttendanceStatus = "Not checked in" | "Checked in";

export type Registration = {
  id: string;
  code: string;
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

/* ------------------------------ Storage -------------------------------- */

const SCHOOLS_KEY = "sahasaknaada:schools";
const SETTINGS_KEY = "sahasaknaada:settings";
const UPDATE_EVENT = "sahasaknaada:registrations-updated";

function readSchools(): School[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(SCHOOLS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as School[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeSchools(rows: School[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SCHOOLS_KEY, JSON.stringify(rows));
  // Notify same-tab listeners.
  window.dispatchEvent(new CustomEvent(UPDATE_EVENT));
}

function makeId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return "id-" + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function makeCode(prefix = "SSA") {
  const n = Math.floor(Math.random() * 0xffffff)
    .toString(16)
    .toUpperCase()
    .padStart(6, "0");
  return `${prefix}-${n}`;
}

/* ------------------------------ Helpers -------------------------------- */

export function formatMemberNo(n: number): string {
  return String(n).padStart(4, "0");
}

export function listSchools(): School[] {
  return readSchools();
}

function findMemberByCode(
  schools: School[],
  code: string,
): { school: School; member: Member } | null {
  const raw = code.trim();
  if (!raw) return null;
  const upper = raw.toUpperCase().replace(/^#/, "");
  const numeric = raw.replace(/^#/, "");
  for (const s of schools) {
    for (const m of s.members) {
      if (
        m.pass_code.toUpperCase() === upper ||
        s.registration_code.toUpperCase() === upper ||
        formatMemberNo(m.member_no) === upper ||
        (/^\d+$/.test(numeric) && String(m.member_no) === numeric)
      ) {
        return { school: s, member: m };
      }
    }
  }
  return null;
}

function cardFor(schools: School[], school: School, member: Member): MemberCard {
  const fresh = schools.find((s) => s.id === school.id) ?? school;
  const freshMember = fresh.members.find((m) => m.id === member.id) ?? member;
  return { member: freshMember, school: fresh, team: fresh.members };
}

/* --------------------------- Check-in logic ---------------------------- */

export async function checkInMember(code: string): Promise<CheckInResult> {
  const schools = readSchools();
  const found = findMemberByCode(schools, code);
  if (!found) return { result: "not_found" };
  const { school, member } = found;
  if (school.status === "cancelled") {
    return { result: "school_cancelled", card: cardFor(schools, school, member) };
  }
  if (member.checked_in_at) {
    return { result: "already_checked_in", card: cardFor(schools, school, member) };
  }
  const now = new Date().toISOString();
  const next = schools.map((s) =>
    s.id === school.id
      ? {
          ...s,
          members: s.members.map((m) => (m.id === member.id ? { ...m, checked_in_at: now } : m)),
        }
      : s,
  );
  writeSchools(next);
  return { result: "checked_in", card: cardFor(next, school, member) };
}

export async function checkInTeam(schoolId: string): Promise<number> {
  const schools = readSchools();
  const school = schools.find((s) => s.id === schoolId);
  if (!school || school.status === "cancelled") return 0;
  const now = new Date().toISOString();
  let count = 0;
  const next = schools.map((s) => {
    if (s.id !== schoolId) return s;
    const members = s.members.map((m) => {
      if (m.checked_in_at) return m;
      count++;
      return { ...m, checked_in_at: now };
    });
    return { ...s, members };
  });
  writeSchools(next);
  return count;
}

export async function undoCheckIn(memberId: string): Promise<UndoResult> {
  const schools = readSchools();
  let target: { school: School; member: Member } | null = null;
  for (const s of schools) {
    const m = s.members.find((x) => x.id === memberId);
    if (m) {
      target = { school: s, member: m };
      break;
    }
  }
  if (!target) return { result: "not_found" };
  const next = schools.map((s) =>
    s.id === target!.school.id
      ? {
          ...s,
          members: s.members.map((m) => (m.id === memberId ? { ...m, checked_in_at: null } : m)),
        }
      : s,
  );
  writeSchools(next);
  return { result: "undone", card: cardFor(next, target.school, target.member) };
}

/* --------------------------- School management ------------------------- */

export function setSchoolStatus(schoolId: string, status: SchoolStatus) {
  const schools = readSchools().map((s) => (s.id === schoolId ? { ...s, status } : s));
  writeSchools(schools);
}

export function deleteSchool(schoolId: string) {
  writeSchools(readSchools().filter((s) => s.id !== schoolId));
}

/* ----------------------------- Settings -------------------------------- */

const DEFAULT_SETTINGS: EventSettings = {
  registration_open: true,
  max_members_per_school: 10,
};

export async function getEventSettings(): Promise<EventSettings> {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = window.localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Partial<EventSettings>) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveEventSettings(next: EventSettings): Promise<void> {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
}

/* ---------------------- Public registration flow ----------------------- */

function toRegistration(school: School, member: Member): Registration {
  const statusMap: Record<SchoolStatus, RegistrationStatus> = {
    confirmed: "Confirmed",
    needs_review: "Needs review",
    cancelled: "Cancelled",
  };
  return {
    id: member.id,
    code: member.pass_code,
    fullName: member.full_name,
    school: school.name,
    grade: member.grade,
    email: member.email ?? "",
    phone: member.phone ?? "",
    notes: member.notes ?? "",
    createdAt: school.created_at,
    status: statusMap[school.status],
    attendance: member.checked_in_at ? "Checked in" : "Not checked in",
    checkedInAt: member.checked_in_at,
    checkedInBy: null,
    isDemo: false,
  };
}

export function addRegistration(input: RegistrationInput): { ok: true; record: Registration } {
  const schools = readSchools();
  const norm = (s: string) => s.trim().toLowerCase().replace(/\s+/g, " ");
  const schoolName = input.school.trim();
  const existing = schools.find((s) => norm(s.name) === norm(schoolName));

  const member: Member = {
    id: makeId(),
    member_no: existing ? existing.members.length + 1 : 1,
    pass_code: makeCode("SSA"),
    full_name: input.fullName.trim(),
    grade: input.grade.trim(),
    role: "student",
    email: input.email.trim(),
    phone: input.phone.trim(),
    notes: input.notes.trim(),
    checked_in_at: null,
  };

  if (existing) {
    const updated: School = { ...existing, members: [...existing.members, member] };
    writeSchools(schools.map((s) => (s.id === existing.id ? updated : s)));
    return { ok: true, record: toRegistration(updated, member) };
  }

  const school: School = {
    id: makeId(),
    name: schoolName,
    district: "",
    registration_code: makeCode("SCH"),
    status: "needs_review",
    teacher_name: "",
    created_at: new Date().toISOString(),
    members: [member],
  };
  writeSchools([...schools, school]);
  return { ok: true, record: toRegistration(school, member) };
}

export function listRegistrations(): Registration[] {
  const out: Registration[] = [];
  for (const s of readSchools()) for (const m of s.members) out.push(toRegistration(s, m));
  return out;
}

export function findLikelyDuplicate(input: RegistrationInput, _existing?: Registration[]): boolean {
  const norm = (s: string) => s.trim().toLowerCase().replace(/\s+/g, " ");
  const name = norm(input.fullName);
  const email = norm(input.email);
  if (!name && !email) return false;
  for (const s of readSchools()) {
    for (const m of s.members) {
      const mEmail = norm(m.email ?? "");
      const mName = norm(m.full_name);
      if ((email && mEmail === email) || (name && mName === name)) return true;
    }
  }
  return false;
}

/* ------------------------------ Demo seed ------------------------------ */

function demoMember(
  no: number,
  name: string,
  grade: string,
  role: MemberRole,
  checkedIn: string | null,
): Member {
  return {
    id: makeId(),
    member_no: no,
    pass_code: makeCode("SSA"),
    full_name: name,
    grade,
    role,
    checked_in_at: checkedIn,
  };
}

export function seedDemoData(_staff: string) {
  if (readSchools().length > 0) return;
  const now = Date.now();
  const demo: School[] = [
    {
      id: makeId(),
      name: "Royal College Colombo",
      district: "Colombo",
      registration_code: makeCode("SCH"),
      status: "confirmed",
      teacher_name: "Mr. Perera",
      created_at: new Date(now - 86400000 * 2).toISOString(),
      members: [
        demoMember(1, "Aarav Perera", "Grade 11", "student", null),
        demoMember(2, "Nethmi Silva", "Grade 11", "student", new Date(now - 3600000).toISOString()),
        demoMember(3, "Mr. Perera", "—", "teacher", null),
      ],
    },
    {
      id: makeId(),
      name: "Visakha Vidyalaya",
      district: "Colombo",
      registration_code: makeCode("SCH"),
      status: "needs_review",
      teacher_name: "Ms. Fernando",
      created_at: new Date(now - 86400000).toISOString(),
      members: [
        demoMember(
          1,
          "Dinithi Fernando",
          "Grade 12",
          "student",
          new Date(now - 7200000).toISOString(),
        ),
        demoMember(2, "Kavindi Jayasuriya", "Grade 12", "student", null),
      ],
    },
    {
      id: makeId(),
      name: "Ananda College",
      district: "Colombo",
      registration_code: makeCode("SCH"),
      status: "cancelled",
      teacher_name: "Mr. Wickrama",
      created_at: new Date(now - 3600000 * 5).toISOString(),
      members: [
        demoMember(1, "Sahan Wickrama", "Grade 10", "student", null),
        demoMember(2, "Ishara Bandara", "Grade 10", "student", null),
      ],
    },
  ];
  writeSchools(demo);
}

/*
 * SECURITY NOTE (until Cloud is enabled):
 * There is no real server-side authorization here. The /admin route is gated
 * by a labelled demo sign-in kept in sessionStorage. Do NOT treat demo
 * registrations as private or production-safe. Enabling Cloud adds real
 * authenticated organizer accounts, a persistent database, and RLS so only
 * signed-in organizers can read or change registration data.
 */
