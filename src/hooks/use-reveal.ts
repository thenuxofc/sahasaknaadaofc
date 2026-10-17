import { useEffect, useRef } from "react";

/**
 * Reveal-on-scroll using IntersectionObserver, with a graceful static
 * fallback for reduced-motion / no-IO. Add `data-reveal` (or pass
 * `selector`) to any element; it toggles the `.is-visible` class that
 * the `.reveal` utility in styles.css animates.
 */
export function useReveal<T extends HTMLElement = HTMLElement>(
  selector = "[data-reveal]",
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const root = ref.current ?? document;
    const els = Array.from(
      root.querySelectorAll<HTMLElement>(selector),
    );
    if (els.length === 0) return;

    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    if (reduce || typeof IntersectionObserver === "undefined") {
      els.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            io.unobserve(e.target);
          }
        });
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.1 },
    );

    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [selector]);

  return ref;
}