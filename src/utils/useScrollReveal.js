import { useEffect, useRef } from "react";

// Adds "in-view" the first time the element crosses into the viewport, so
// below-the-fold sections actually animate on scroll instead of finishing
// their entrance animation instantly at mount (before anyone could see it).
export function useScrollReveal(options) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    if (typeof IntersectionObserver === "undefined") {
      el.classList.add("in-view");
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("in-view");
          observer.unobserve(el);
        }
      },
      { threshold: 0.15, ...options }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [options]);

  return ref;
}
