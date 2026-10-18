import { useEffect, useState } from "react";

import { TechText } from "@/components/bits/tech-text";
import { THEMES } from "@/lib/content";
import { cn } from "@/lib/utils";

/*
 * SOUND / SCIENCE / CREATIVITY — oversized editorial typography.
 *
 * Desktop default: visible semantic text (also the accessible source of
 *   truth). On mount, if motion is allowed, the row upgrades to the
 *   canvas-based TechText dashed-glyph effect laid over the text — so
 *   reduced-motion / no-canvas / pre-hydration always shows the real word.
 *   guides/labels/selection/specks/clickKick/draggable are OFF so no
 *   bounding-box, coordinate readout, or debug overlays ever reach the
 *   finished public interface. Stagger is paddingLeft inside a w-full row
 *   so it can never push content past the section edge.
 *
 * Mobile: a clean responsive text composition with the same white/gold
 *   contrast and a restrained left-staggered rhythm. Sized with clamp() so
 *   CREATIVITY — the longest word — fits at 320px without clipping or
 *   horizontal overflow. No canvas on phones.
 */
export function Themes() {
  const [canvasOn, setCanvasOn] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    if (!reduce) setCanvasOn(true);
  }, []);

  return (
    <section id="themes" className="border-b border-hairline">
      <div className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-8 md:py-28">
        <div className="mb-10 flex items-center gap-4 md:mb-14">
          <span className="text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">
            The three pillars
          </span>
          <span className="h-px flex-1 bg-hairline" aria-hidden />
        </div>

        {/* Mobile — deliberate responsive text composition (no canvas) */}
        <div className="flex flex-col gap-3 md:hidden">
          {THEMES.map((t) => (
            <div
              key={t.word}
              data-reveal
              style={{ paddingLeft: `${t.mobileOffset}rem` }}
              className="reveal w-full min-w-0"
            >
              <h2
                className={cn(
                  "font-display font-bold leading-[0.92] tracking-tight",
                  "text-[clamp(2.5rem,12vw,4rem)]",
                  t.emphasis === "gold" ? "text-gold" : "text-foreground",
                )}
                style={{ overflowWrap: "break-word" }}
              >
                {t.word}
              </h2>
            </div>
          ))}
        </div>

        {/* Desktop — visible text base layer, canvas upgrades over it */}
        <div className="hidden flex-col gap-6 md:flex">
          {THEMES.map((t) => (
            <div
              key={t.word}
              data-reveal
              style={{ paddingLeft: `${t.offset}rem` }}
              className={cn(
                "reveal relative w-full min-w-0",
                t.emphasis === "gold" ? "text-gold" : "text-foreground",
              )}
            >
              <h2
                className={cn(
                  "font-display font-bold leading-[1] tracking-tight",
                  "text-[3.5rem] lg:text-[5rem]",
                )}
                aria-hidden={canvasOn ? true : undefined}
              >
                {t.word}
              </h2>
              {canvasOn && (
                <div className="pointer-events-none absolute inset-0 h-full" aria-hidden>
                  <TechText
                    text={t.word}
                    fontWeight={600}
                    fontSize={150}
                    reveal="letter"
                    dashLength={4}
                    dashGap={2}
                    specks={0}
                    intro="none"
                    introDuration={2}
                    clickKick={false}
                    guides={false}
                    fontFamily=""
                    letterSpacing={-0.05}
                    accentColor="currentColor"
                    reach={200}
                    softness={0.7}
                    lineStyle="dashed"
                    strokeWidth={1.5}
                    speed={1}
                    bounce={0.4}
                    selection={false}
                    labels={false}
                    color="currentColor"
                    align="left"
                    draggable={false}
                    sweep
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        <p
          data-reveal
          className="reveal mt-12 max-w-2xl text-base leading-relaxed text-muted-foreground text-pretty md:mt-14"
        >
          Sound is the medium. Science is how we understand it. Creativity is what we do with it.
          Sahasaknaada brings students from different schools together to explore all three — hands
          on, in one room.
        </p>
      </div>
    </section>
  );
}
