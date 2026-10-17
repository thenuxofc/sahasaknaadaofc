import { Link, createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useReveal } from "@/hooks/use-reveal";
import {
  listRegistrations,
  seedDemoData,
  type Registration,
} from "@/lib/registration";
import { AdminTopBar, Tabs, type Tab } from "@/components/admin/primitives";
import { Overview } from "@/components/admin/overview";
import { Registrations } from "@/components/admin/registrations";
import { CheckIn } from "@/components/admin/checkin";
import { ExportPanel } from "@/components/admin/export";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Organizer Dashboard — Sahasaknaada" },
      {
        name: "description",
        content:
          "Private organizer dashboard for Sahasaknaada registrations, check-in and reports.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

const SESSION_KEY = "sahasaknaada:admin-session";

function AdminPage() {
  useReveal();
  return <AdminGate />;
}

function AdminGate() {
  const [signedIn, setSignedIn] = useState(false);
  const [staff, setStaff] = useState("Organizer");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = window.sessionStorage.getItem(SESSION_KEY);
    if (raw) {
      setStaff(raw);
      setSignedIn(true);
    }
  }, []);

  function signIn(name: string) {
    window.sessionStorage.setItem(SESSION_KEY, name || "Organizer");
    setStaff(name || "Organizer");
    setSignedIn(true);
    seedDemoData(name || "Organizer");
  }

  function signOut() {
    window.sessionStorage.removeItem(SESSION_KEY);
    setSignedIn(false);
  }

  if (!signedIn) return <AdminSignIn onSignIn={signIn} />;
  return <AdminDashboard staff={staff} onSignOut={signOut} />;
}

function AdminSignIn({ onSignIn }: { onSignIn: (name: string) => void }) {
  const [name, setName] = useState("");
  const [pass, setPass] = useState("");
  return (
    <div className="grid min-h-screen place-items-center px-5">
      <div
        data-reveal
        className="reveal w-full max-w-sm rounded-3xl border border-hairline bg-surface p-8"
      >
        <div className="mb-6 flex items-center gap-2 text-gold">
          <ShieldCheck className="h-5 w-5" />
          <span className="text-sm font-medium uppercase tracking-[0.18em]">
            Organizer access
          </span>
        </div>
        <h1 className="font-display text-2xl font-bold tracking-tight">
          Sign in to the dashboard
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Demo sign-in — any name and password works here. This is not a secure
          login; enable Cloud for real organizer accounts.
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSignIn(name.trim() || "Organizer");
          }}
          className="mt-6 flex flex-col gap-4"
        >
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">Organizer name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="Your name"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">Password</span>
            <input
              type="password"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              className="rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="••••••"
            />
          </label>
          <Button
            type="submit"
            className="mt-2 border border-gold/40 bg-primary text-primary-foreground hover:border-gold/70 hover:bg-secondary focus-visible:ring-gold"
          >
            Sign in
          </Button>
        </form>
        <Link
          to="/"
          className="mt-5 inline-block text-xs text-muted-foreground hover:text-foreground"
        >
          ← Back to the public site
        </Link>
      </div>
    </div>
  );
}

function AdminDashboard({
  staff,
  onSignOut,
}: {
  staff: string;
  onSignOut: () => void;
}) {
  const [tab, setTab] = useState<Tab>("overview");
  const [rows, setRows] = useState<Registration[]>([]);

  useEffect(() => {
    const load = () => setRows(listRegistrations());
    load();
    const onUpdate = () => load();
    window.addEventListener("sahasaknaada:registrations-updated", onUpdate);
    window.addEventListener("storage", onUpdate);
    return () => {
      window.removeEventListener("sahasaknaada:registrations-updated", onUpdate);
      window.removeEventListener("storage", onUpdate);
    };
  }, []);

  function refresh() {
    setRows(listRegistrations());
  }

  return (
    <div className="min-h-screen">
      <AdminTopBar staff={staff} onSignOut={onSignOut} />
      <div className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8">
        <Tabs tab={tab} setTab={setTab} />
        <div className="mt-8">
          {tab === "overview" && <Overview rows={rows} />}
          {tab === "registrations" && (
            <Registrations rows={rows} staff={staff} onChanged={refresh} />
          )}
          {tab === "checkin" && (
            <CheckIn rows={rows} staff={staff} onChanged={refresh} />
          )}
          {tab === "export" && <ExportPanel rows={rows} onReset={refresh} />}
        </div>
      </div>
    </div>
  );
}