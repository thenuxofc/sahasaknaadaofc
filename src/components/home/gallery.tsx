import { useRef, useState } from "react";

import { DotGrid } from "@/components/bits/dot-grid";
import { GALLERY } from "@/lib/content";
import { cn } from "@/lib/utils";

/**
 * Intra-school gallery. Horizontal scroll-snap with touch drag and
 * keyboard-accessible buttons. A lightweight fallback for the FlexCarousel
 * component named in the source guide — works without WebGL, and respects
 * reduced motion via native scroll (no auto-play).
 */
export function Gallery() {
  const [active, setActive] = useState(GALLERY[0]?.id ?? "");
  const scroller = useRef<HTMLDivElement>(null);

  const reduce =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  return (
    <section id="gallery" className="relative overflow-hidden border-b border-hairline">
      {/* Ambient dot-grid background — subtle, restrained, reduced-motion safe */}
      <DotGrid
        className="pointer-events-none absolute inset-0 z-0"
        baseColor="#18181b"
        activeColor="#dadae0"
        dotSize={4}
        gap={26}
        proximity={130}
        strength={0.8}
        swell={0.6}
        glow={0.45}
        opacity={0.6}
        intro
        mouseInteraction
      />
      <div
        className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-b from-background/40 via-background/10 to-background/60"
        aria-hidden
      />
      <div className="relative z-10 mx-auto w-full max-w-6xl px-5 py-20 sm:px-8 md:py-24">
        <div className="mb-10 flex flex-col items-center text-center">
          <p className="text-xs font-medium uppercase tracking-[0.28em] text-gold">Intra-school</p>
          <h2 className="mt-4 font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Moments from our workshops
          </h2>
          <p className="mt-3 max-w-md text-sm text-muted-foreground">
            Moments from our previous intra-school workshops. Approved photos to be added.
          </p>
        </div>

        {/* Carousel */}
        <div
          ref={scroller}
          tabIndex={0}
          role="group"
          aria-label="Intra-school workshop gallery"
          className={cn(
            "flex snap-x snap-mandatory gap-3 overflow-x-auto rounded-3xl border border-hairline bg-surface/40 p-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            "[scrollbar-width:thin] [scrollbar-color:var(--color-hairline)_transparent]",
            reduce ? "" : "[scroll-behavior:smooth]",
          )}
        >
          {GALLERY.map((item) => (
            <figure
              key={item.id}
              className="relative flex h-[440px] w-[88vw] shrink-0 snap-center overflow-hidden rounded-2xl border border-hairline bg-card sm:w-[60vw] md:w-[420px]"
              aria-label={item.title}
            >
              <GalleryPhoto item={item} />
              <figcaption className="absolute inset-x-0 bottom-0 flex flex-col gap-1 bg-gradient-to-t from-black/80 to-transparent p-4 pt-12">
                <span className="text-sm font-semibold text-foreground">{item.title}</span>
                <span className="text-xs text-muted-foreground">{item.caption}</span>
              </figcaption>
            </figure>
          ))}
        </div>

        {/* Dot indicators / controls */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          {GALLERY.map((g) => (
            <button
              key={g.id}
              type="button"
              aria-label={`Show photo: ${g.title}`}
              aria-pressed={active === g.id}
              onClick={() => {
                setActive(g.id);
                const el = document.getElementById(`gphoto-${g.id}`);
                el?.scrollIntoView({
                  behavior: reduce ? "auto" : "smooth",
                  inline: "center",
                  block: "nearest",
                });
              }}
              className={cn(
                "h-2.5 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                active === g.id
                  ? "w-7 bg-gold"
                  : "w-2.5 bg-muted-foreground/40 hover:bg-muted-foreground/70",
              )}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function GalleryPhoto({ item }: { item: (typeof GALLERY)[number] }) {
  // Approved photos not yet supplied — labelled placeholder, never stock.
  return (
    <div
      id={`gphoto-${item.id}`}
      className="relative grid h-full w-full place-items-center bg-gradient-to-br from-surface to-black/40"
    >
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 30% 30%, var(--color-gold) 0, transparent 60%)",
        }}
        aria-hidden
      />
      <div className="flex flex-col items-center gap-3 px-6 text-center">
        <svg
          className="h-10 w-10 text-gold/50"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          aria-hidden
        >
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path d="m21 15-3.5-3.5L8 21" />
        </svg>
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Approved photo
        </p>
        <p className="text-sm text-muted-foreground">to be added</p>
      </div>
    </div>
  );
}
