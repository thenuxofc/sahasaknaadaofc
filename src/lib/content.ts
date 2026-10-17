/*
 * Sahasaknaada — editable content.
 *
 * All unconfirmed values live here as clearly-labelled placeholders so the
 * organizers can replace them in one place. Confirmed facts only:
 *   - Event: Sahasaknaada — inter-school audio workshop
 *   - Host: Radio Club of D. S. Senanayake College
 *   - Themes: Sound / Science / Creativity
 *   - Hero headline: "The Future of Sound Starts Here"
 * No real dates, venues, fees, contacts or photos have been supplied.
 */

export type NavSection = { label: string; href: string };

export const EVENT = {
  name: "Sahasaknaada",
  tagline: "Inter-school audio workshop",
  host: "Radio Club of D. S. Senanayake College",
  heroHeadline: "The Future of Sound Starts Here",
  heroAccentWord: "Sound",
  heroCopy:
    "Sahasaknaada is an inter-school audio workshop by the Radio Club of D. S. Senanayake College — bringing students together to explore sound, audio technology and creativity.",
};

export const NAV_SECTIONS: NavSection[] = [
  { label: "Themes", href: "/#themes" },
  { label: "Gallery", href: "/#gallery" },
  { label: "Agenda", href: "/#agenda" },
  { label: "FAQ", href: "/#faq" },
];

export type ThemeWord = {
  word: string;
  /** white vs gold emphasis */
  emphasis: "white" | "gold";
  /** horizontal stagger in rem on desktop */
  offset: number;
};

export const THEMES: ThemeWord[] = [
  { word: "SOUND", emphasis: "white", offset: 0 },
  { word: "SCIENCE", emphasis: "gold", offset: 4 },
  { word: "CREATIVITY", emphasis: "white", offset: 8 },
];

export type GalleryItem = {
  id: string;
  title: string;
  caption: string;
  /** Approved photo URL — replace placeholder once assets are supplied. */
  src: string | null;
  alt: string;
};

export const GALLERY: GalleryItem[] = [
  {
    id: "g1",
    title: "Workshop session",
    caption: "Approved photo to be added",
    src: null,
    alt: "Students at a previous intra-school audio workshop (approved photo to be added)",
  },
  {
    id: "g2",
    title: "On-air practice",
    caption: "Approved photo to be added",
    src: null,
    alt: "Radio Club members practising on-air during an intra-school session (approved photo to be added)",
  },
  {
    id: "g3",
    title: "Sound exploration",
    caption: "Approved photo to be added",
    src: null,
    alt: "Participants exploring sound equipment at an intra-school workshop (approved photo to be added)",
  },
  {
    id: "g4",
    title: "Group discussion",
    caption: "Approved photo to be added",
    src: null,
    alt: "Students in a group discussion at an intra-school workshop (approved photo to be added)",
  },
  {
    id: "g5",
    title: "Live mixing",
    caption: "Approved photo to be added",
    src: null,
    alt: "A student mixing audio at a previous intra-school competition (approved photo to be added)",
  },
];

export type AgendaEntry = {
  id: string;
  item: string;
  time: string;
  /** "placeholder" entries are clearly labelled, not presented as final. */
  isPlaceholder: boolean;
};

/** Agenda to be confirmed by organizers — placeholder shown until supplied. */
export const AGENDA: AgendaEntry[] = [
  { id: "a1", item: "Agenda to be announced", time: "—", isPlaceholder: true },
];

export type FaqEntry = {
  id: string;
  question: string;
  answer: string;
  isPlaceholder: boolean;
};

/** Answers not confirmed by organizers — labelled placeholders, not invented facts. */
export const FAQS: FaqEntry[] = [
  {
    id: "f1",
    question: "Who can register?",
    answer: "Confirmed by the organizer — placeholder answer to be added.",
    isPlaceholder: true,
  },
  {
    id: "f2",
    question: "Is there a registration fee?",
    answer: "Confirmed by the organizer — placeholder answer to be added.",
    isPlaceholder: true,
  },
  {
    id: "f3",
    question: "Where and when does the workshop take place?",
    answer: "Confirmed by the organizer — placeholder answer to be added.",
    isPlaceholder: true,
  },
  {
    id: "f4",
    question: "What should I bring?",
    answer: "Confirmed by the organizer — placeholder answer to be added.",
    isPlaceholder: true,
  },
  {
    id: "f5",
    question: "How will I know my registration is confirmed?",
    answer: "Confirmed by the organizer — placeholder answer to be added.",
    isPlaceholder: true,
  },
];

export type FooterLink = { label: string; href: string | null };

export const FOOTER_SOCIALS: FooterLink[] = [
  { label: "Instagram", href: null },
  { label: "Facebook", href: null },
  { label: "YouTube", href: null },
];

/** Copyright year — replace with the confirmed edition year once supplied. */
export const COPYRIGHT_YEAR = "—";

/*
 * Registration form field configuration.
 * Organizers must confirm which fields are included and required.
 */
export type FieldKey =
  | "fullName"
  | "school"
  | "grade"
  | "email"
  | "phone"
  | "notes";

export type FieldDef = {
  key: FieldKey;
  label: string;
  hint?: string;
  type: "text" | "email" | "tel";
  required: boolean;
  maxLength: number;
};

export const REG_FIELDS: FieldDef[] = [
  { key: "fullName", label: "Full name", type: "text", required: true, maxLength: 80 },
  { key: "school", label: "School", type: "text", required: true, maxLength: 120 },
  { key: "grade", label: "Grade / year", type: "text", required: true, maxLength: 20 },
  { key: "email", label: "Email", type: "email", required: true, maxLength: 120 },
  { key: "phone", label: "Contact number", type: "tel", required: true, maxLength: 20 },
  { key: "notes", label: "Anything else we should know? (optional)", type: "text", required: false, maxLength: 300 },
];