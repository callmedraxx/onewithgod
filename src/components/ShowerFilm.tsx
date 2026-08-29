/**
 * The rainfall shower, running.
 *
 * This is the one product on the page that a photograph genuinely cannot
 * sell. A ceiling shower is a still rectangle until the water is on; what
 * a buyer is paying for is the spread of the fall, the LED changing, and
 * the fact that it is actually a curtain rather than a spray. Twenty-seven
 * seconds of it does the whole job.
 *
 * Everything below is about the cost of that, because this audience is on
 * mobile data and a video is the single most expensive thing a page can put
 * in front of them:
 *
 *   * The file is not fetched until the section is near the viewport.
 *     `preload="none"` plus a src that is only set on approach means someone
 *     who never scrolls this far pays nothing at all for it.
 *   * A poster frame stands in until then, so the section is never an empty
 *     black box and the layout never shifts.
 *   * It plays only while it is on screen and pauses the moment it leaves.
 *     A video playing to nobody is somebody's data and somebody's battery.
 *   * Muted, looping, inline. Muted is not a preference — autoplay is
 *     refused outright on every mobile browser without it.
 */

import { useEffect, useRef, useState } from "react";
import { WhatsAppButton } from "@/components/WhatsApp";
import { BUSINESS, whatsappLink } from "@/lib/site";
import { Reveal } from "@/components/Reveal";

const ENQUIRY =
  `Hello ${BUSINESS.name}, I saw the LED rainfall shower on your website. ` +
  `What sizes do you have and what is the price?`;

export function ShowerFilm() {
  const wrap = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [armed, setArmed] = useState(false); // has the file been requested
  const [playing, setPlaying] = useState(false);

  /* Two observers with different thresholds, because "load it" and "play it"
     are different questions. The first fires early and generously so the
     first frames are decoded before anyone arrives; the second only once the
     section genuinely holds the screen. */
  useEffect(() => {
    const el = wrap.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setArmed(true);
      return;
    }

    const arm = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setArmed(true);
          arm.disconnect();
        }
      },
      { rootMargin: "250% 0px" },
    );
    arm.observe(el);

    const play = new IntersectionObserver(
      ([e]) => {
        const v = video.current;
        if (!v) return;
        if (e.isIntersecting) {
          // A rejected play() is normal — a browser may refuse until the
          // visitor has interacted. It is not worth an error.
          v.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
        } else {
          v.pause();
          setPlaying(false);
        }
      },
      { threshold: 0.35 },
    );
    play.observe(el);

    return () => {
      arm.disconnect();
      play.disconnect();
    };
  }, []);

  return (
    <section className="border-t border-hairline bg-void">
      <div className="mx-auto max-w-6xl px-5 py-16 lg:py-24">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-16">
          <div>
            <Reveal kind="mask" as="h2" className="display text-5xl sm:text-6xl lg:text-7xl">
              Rain, from the ceiling
            </Reveal>
            <Reveal kind="fade" as="p" delay={0.12} className="mt-4 max-w-md text-chalk-soft">
              A recessed LED panel the full width of the ceiling, with a
              colour changing surround and a separate handset. This is ours,
              running.
            </Reveal>

            <Reveal kind="rise" delay={0.2} speed="fast" className="mt-8">
              <WhatsAppButton message={ENQUIRY}>Ask about this shower</WhatsAppButton>
            </Reveal>

            <Reveal kind="fade" delay={0.3} as="p"
                    className="mt-5 text-xs text-chalk-soft/70">
              Filmed at {BUSINESS.showroom.split(",")[0]}.
            </Reveal>
          </div>

          {/* The frame. Portrait, because that is how it was shot and
              letterboxing a 9:16 clip into a 16:9 box to look "designed"
              throws away most of the picture. */}
          <Reveal kind="scale" speed="slow" className="justify-self-center lg:justify-self-end">
            <div
              ref={wrap}
              className="relative w-[min(78vw,20rem)] overflow-hidden rounded-[1.75rem]
                         border border-hairline bg-surface shadow-2xl shadow-black/60
                         sm:w-[22rem]"
              style={{ aspectRatio: "464 / 832" }}
            >
              <video
                ref={video}
                // Only once the section is approaching. Until then this is a
                // poster and nothing else has been fetched.
                src={armed ? "/showroom-720.mp4" : undefined}
                poster="/showroom-poster.jpg"
                muted
                loop
                playsInline
                preload="none"
                aria-label="LED rainfall ceiling shower running"
                className="h-full w-full object-cover"
              />

              {/* Sits over the video only while it is not running, so a
                  paused or refused autoplay never looks like a broken
                  element. */}
              {!playing && (
                <div className="pointer-events-none absolute inset-0 flex items-end
                                justify-center bg-gradient-to-t from-void/70 to-transparent
                                pb-5">
                  <span className="text-[10px] uppercase tracking-[0.24em] text-chalk/80">
                    The shower, running
                  </span>
                </div>
              )}
            </div>
          </Reveal>
        </div>

        {/* A second route out, for anyone who watched the film rather than
            read the column beside it. */}
        <a
          href={whatsappLink(ENQUIRY)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-10 inline-flex text-sm font-semibold text-gold transition-colors
                     hover:text-gold-deep lg:hidden"
        >
          Ask about this shower →
        </a>
      </div>
    </section>
  );
}
