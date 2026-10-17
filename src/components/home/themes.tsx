import { THEMES } from "@/lib/content";
import { cn } from "@/lib/utils";

export function Themes() {
  return (
    <section id="themes" className="border-b border-hairline">
      <div className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-8 md:py-28">
        <div className="mb-12 flex items-center gap-4">
          <span className="text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">
            The three pillars
          </span>
          <span className="h-px flex-1 bg-hairline" aria-hidden />
        </div>

        <div className="flex flex-col gap-3 md:gap-5">
          {THEMES.map((t, i) => (
            <h2
              key={t.word}
              data-reveal
              style={{ marginLeft: `${t.offset}rem` }}
              className={cn(
                "reveal font-display text-5xl font-extrabold leading-none tracking-tight transition-colors sm:text-6xl md:text-7xl lg:text-8xl",
                t.emphasis === "gold"
                  ? "text-gold"
                  : "text-foreground",
              )}
            >
              {t.word}
            </h2>
          ))}
        </div>

        <p
          data-reveal
          className="reveal mt-12 max-w-2xl text-base leading-relaxed text-muted-foreground text-pretty"
        >
          Sound is the medium. Science is how we understand it. Creativity is
          what we do with it. Sahasaknaada brings students from different
          schools together to explore all three — hands on, in one room.
        </p>
      </div>
    </section>
  );
}