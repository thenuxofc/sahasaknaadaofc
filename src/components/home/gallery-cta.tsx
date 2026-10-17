import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";

export function GalleryCta() {
  return (
    <section className="border-b border-hairline">
      <div className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 md:py-20">
        <div
          data-reveal
          className="reveal ambient-gold-soft relative overflow-hidden rounded-3xl border border-gold-deep/30 bg-gold px-8 py-12 text-gold-foreground sm:px-14 md:py-16"
        >
          <div className="absolute inset-0 opacity-10" aria-hidden>
            <div
              className="h-full w-full"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 85% 20%, var(--color-gold-deep) 0, transparent 45%)",
              }}
            />
          </div>

          <div className="relative flex flex-col items-start gap-8 md:flex-row md:items-center md:justify-between">
            <div className="max-w-xl">
              <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                Be part of the room where sound comes alive.
              </h2>
              <p className="mt-4 text-base leading-relaxed opacity-80">
                Students from any school are welcome to register and take part in Sahasaknaada.
              </p>
            </div>

            <Button
              asChild
              size="lg"
              className="shrink-0 border border-black/10 bg-black text-white hover:border-black/20 hover:bg-black/85 focus-visible:ring-black/40"
            >
              <Link to="/register" className="gap-2 focus-visible:outline-none">
                Register Now
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
