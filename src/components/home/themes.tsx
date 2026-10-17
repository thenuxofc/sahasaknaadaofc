import { TechText } from "@/components/bits/tech-text";
import { THEMES } from "@/lib/content";
import { cn } from "@/lib/utils";

export function Themes() {
  return (
    <section id="themes" className="border-b border-hairline">
      <div className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-8 md:py-28">
        <div className="mb-10 flex items-center gap-4 md:mb-14">
          <span className="text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">
            The three pillars
          </span>
          <span className="h-px flex-1 bg-hairline" aria-hidden />
        </div>

        <div className="flex flex-col gap-4 md:gap-6">
          {THEMES.map((t) => (
            <div
              key={t.word}
              data-reveal
              style={{ marginLeft: `${t.offset}rem` }}
              className={cn(
                "reveal w-full max-w-[min(100%,46rem)]",
                t.emphasis === "gold" ? "text-gold" : "text-foreground",
              )}
            >
              {/* Accessible heading + SEO text — canvas is the visual layer */}
              <h2 className="sr-only">{t.word}</h2>
              <div className="h-28 w-full sm:h-36 md:h-44">
                <TechText
                  text={t.word}
                  fontWeight={600}
                  fontSize={150}
                  reveal="letter"
                  dashLength={4}
                  dashGap={2}
                  specks={15}
                  intro="none"
                  introDuration={2}
                  clickKick
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
                  selection
                  labels
                  color="currentColor"
                  align="center"
                  draggable
                  sweep
                />
              </div>
            </div>
          ))}
        </div>

        <p
          data-reveal
          className="reveal mt-12 max-w-2xl text-base leading-relaxed text-muted-foreground text-pretty"
        >
          Sound is the medium. Science is how we understand it. Creativity is what we do with it.
          Sahasaknaada brings students from different schools together to explore all three — hands
          on, in one room.
        </p>
      </div>
    </section>
  );
}
