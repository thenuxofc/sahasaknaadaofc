import { Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { EVENT } from "@/lib/content";

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-hairline">
      {/* subtle warm ambient bloom, kept away from body copy */}
      <div className="ambient-gold pointer-events-none absolute inset-0 opacity-70" aria-hidden />

      <div className="mx-auto grid w-full max-w-6xl gap-12 px-5 pb-20 pt-16 sm:px-8 md:grid-cols-[1.1fr_0.9fr] md:gap-8 md:pb-28 md:pt-24">
        {/* Left: copy */}
        <div className="flex flex-col justify-center">
          <p
            data-reveal
            className="text-xs font-medium uppercase tracking-[0.22em] text-gold"
          >
            {EVENT.host}
          </p>

          <h1
            data-reveal
            className="reveal mt-5 font-display text-5xl font-bold leading-[0.98] tracking-tight text-foreground text-balance sm:text-6xl md:text-7xl"
          >
            The Future of{" "}
            <span className="text-gold">{EVENT.heroAccentWord}</span> Starts Here
          </h1>

          <p
            data-reveal
            className="reveal mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground text-pretty"
          >
            {EVENT.heroCopy}
          </p>

          <div data-reveal className="reveal mt-9 flex flex-wrap items-center gap-4">
            <Button
              asChild
              size="lg"
              className="border border-gold/40 bg-primary px-7 text-primary-foreground transition-colors hover:border-gold/80 hover:bg-secondary focus-visible:ring-gold"
            >
              <Link to="/register" className="focus-visible:outline-none">
                Register Now
              </Link>
            </Button>
            <a
              href="/#agenda"
              className="text-sm font-medium text-foreground underline-offset-4 transition-colors hover:text-gold hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background rounded"
            >
              See the agenda
            </a>
          </div>
        </div>

        {/* Right: logo visual anchor */}
        <div className="relative flex items-center justify-center md:justify-end">
          <div className="ambient-gold-soft relative grid aspect-square w-full max-w-md place-items-center rounded-3xl border border-hairline bg-surface/60">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-transparent to-black/20" aria-hidden />
            <LogoMark className="h-44 w-44 text-foreground sm:h-56 sm:w-56" />
            <span className="absolute bottom-5 left-1/2 -translate-x-1/2 text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
              {EVENT.name}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

function LogoMark({ className }: { className?: string }) {
  // Restrained signal/waveform emblem — not an invented official crest.
  return (
    <svg
      className={className}
      viewBox="0 0 120 120"
      fill="none"
      aria-hidden
    >
      <circle cx="60" cy="60" r="58" stroke="currentColor" strokeOpacity="0.12" strokeWidth="1.5" />
      <circle cx="60" cy="60" r="44" stroke="currentColor" strokeOpacity="0.18" strokeWidth="1.5" />
      <g stroke="currentColor" strokeWidth="3.5" strokeLinecap="round">
        <path d="M30 60 L34 60 L40 40 L48 82 L56 44 L64 72 L72 54 L80 60 L90 60" />
      </g>
      <circle cx="60" cy="60" r="3.5" fill="var(--gold)" />
    </svg>
  );
}