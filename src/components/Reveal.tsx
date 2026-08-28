/**
 * Scroll reveals.
 *
 * Two rules shape this, and both are about what happens when things go
 * wrong rather than when they go right.
 *
 * **The default is visible.** Nothing here hides content in CSS that ships
 * to the browser. A `js` class is put on <html> at boot, and only then does
 * the hidden state apply. If the script fails, is blocked, or arrives late
 * on a bad connection — which is the normal case for the audience this site
 * is for — every word is simply on the page. The alternative, which is what
 * most reveal libraries actually do, is a blank page for anyone whose
 * JavaScript did not make it.
 *
 * **The entrance is not the same everywhere.** One identical fade-up on
 * every element is the tell of a plugin rather than a design. A heavy
 * condensed heading gets a mask that wipes it up out of its own baseline;
 * body copy just rises; grids arrive in sequence so the eye is led along
 * them rather than hit with all six at once.
 *
 * Motion is one-way: elements do not re-hide when scrolled past. Content
 * that disappears on the way back up is a bug wearing a costume.
 */

import { useEffect, useRef, useState } from "react";

export type RevealKind = "mask" | "rise" | "scale" | "left" | "right" | "fade" | "blur";

export function Reveal({
  children,
  kind = "rise",
  delay = 0,
  /** "fast" for small or secondary things, so the page is not one tempo. */
  speed = "normal",
  as: Tag = "div",
  className = "",
}: {
  children: React.ReactNode;
  kind?: RevealKind;
  /** Seconds. Used to lead the eye along a row, not to make people wait. */
  delay?: number;
  speed?: "fast" | "normal" | "slow";
  as?: React.ElementType;
  className?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // No observer (old browser, odd webview): show it and move on.
    if (typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect(); // one-way; never re-hide
        }
      },
      // Fires a little before the element reaches the viewport edge, so the
      // motion is finishing as it arrives rather than starting there.
      { rootMargin: "0px 0px -12% 0px", threshold: 0.08 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const style = delay
    ? ({ "--reveal-delay": `${delay}s` } as React.CSSProperties)
    : undefined;

  /* The mask variant clips the element to zero area while hidden — and a
   * zero-area element reports an empty intersection rect, so the threshold
   * never passes and the thing that needs revealing can never trigger its
   * own reveal. It is a closed loop, and it silently left every masked
   * heading at opacity 0 forever.
   *
   * So the observed box and the clipped box are different elements: the
   * outer one is measured and never styled, the inner one carries the
   * animation. Layout is unaffected either way, because clip-path does not
   * change an element's box.
   *
   * The other variants only translate and fade, which leaves the box intact,
   * so they stay a single element — an extra wrapper would break the flex
   * and grid children that some of them are. */
  if (kind === "mask") {
    return (
      <Tag ref={ref} className={className}>
        <span
          data-reveal="mask"
          data-shown={shown ? "true" : undefined}
          data-speed={speed}
          style={style}
          className="block"
        >
          {children}
        </span>
      </Tag>
    );
  }

  return (
    <Tag
      ref={ref}
      data-reveal={kind}
      data-shown={shown ? "true" : undefined}
      data-speed={speed}
      style={style}
      className={className}
    >
      {children}
    </Tag>
  );
}

/** Reveals its children in sequence. */
export function RevealGroup({
  children,
  kind = "rise",
  step = 0.07,
  start = 0,
  className = "",
}: {
  children: React.ReactNode[];
  kind?: RevealKind;
  /** Gap between successive children. Small — this leads the eye, it does
   *  not stage a performance. */
  step?: number;
  start?: number;
  className?: string;
}) {
  return (
    <>
      {children.map((child, i) => (
        <Reveal key={i} kind={kind} delay={start + i * step} className={className}>
          {child}
        </Reveal>
      ))}
    </>
  );
}
