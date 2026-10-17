import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EVENT } from "@/lib/content";

export function RegisterCtaBand() {
  return (
    <section className="border-b border-hairline">
      <div className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-8 md:py-28">
        <div
          data-reveal
          className="reveal relative overflow-hidden rounded-4xl bg-gold px-8 py-14 text-gold-foreground sm:px-14 md:py-20"
        >
          <div className="absolute inset-0 opacity-[0.08]" aria-hidden>
            <div
              className="h-full w-full"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 15% 80%, var(--color-gold-deep) 0, transparent 50%)",
              }}
            />
          </div>

          <div className="relative flex flex-col items-start gap-8 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-medium uppercase tracking-[0.22em] text-black/70">
                {EVENT.tagline}
              </p>
              <h2 className="mt-4 font-display text-4xl font-bold leading-[1.02] tracking-tight sm:text-5xl md:text-6xl text-balance">
                Your place at Sahasaknaada is one registration away.
              </h2>
              <p className="mt-5 text-lg leading-relaxed opacity-80 text-pretty">
                Register your spot for the inter-school audio workshop. We'll confirm the details
                once your registration is received.
              </p>
            </div>

            <Button
              asChild
              size="lg"
              className="shrink-0 border border-black/10 bg-black text-white hover:border-black/20 hover:bg-black/85 focus-visible:ring-black/40"
            >
              <Link to="/register" className="gap-2 focus-visible:outline-none">
                Register
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
