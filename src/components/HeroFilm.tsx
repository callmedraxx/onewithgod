/**
 * The hero film: the rainfall shower, running.
 *
 * A ceiling shower is a still rectangle until the water is on. What a buyer
 * is paying for is the spread of the fall, the LED changing behind it, and
 * the fact that it is a curtain rather than a spray. None of that survives a
 * photograph, which is why this is the first thing on the page.
 *
 * ── On resolution, honestly ────────────────────────────────────────────────
 * The source is 464 x 832. That fills a phone beautifully, because a portrait
 * clip in a portrait viewport is running at close to its native scale. It
 * cannot fill a 1440px desktop hero: that is a three times upscale, and no
 * encode adds detail that was never captured. Worse, cropping a 9:16 frame to
 * a landscape band would cut off the ceiling panel, which is the entire
 * subject.
 *
 * So the layout changes rather than the file. On a phone it is full bleed. On
 * a desktop it is a tall panel held near its real size, with the blurred room
 * filling the space around it. Both show the whole frame, and both are sharp.
 *
 * ── On weight ──────────────────────────────────────────────────────────────
 * Two encodes. The full quality one is 4.5MB and only ever goes to a wide
 * screen on a connection that has not asked for less; phones and anything
 * reporting a slow link or Data Saver get a 1.2MB version instead. The poster
 * is sharp and shows immediately, and the video is only attached after first
 * paint, so the headline and the WhatsApp button are usable while it loads.
 */

import { useEffect, useRef, useState } from "react";

type Conn = { saveData?: boolean; effectiveType?: string };

/**
 * Which encode this visitor should get.
 *
 * Deliberately pessimistic. Someone on a metered connection who is served
 * 4.5MB they did not ask for has paid real money for a decision made on
 * their behalf, and the lighter file is not a bad experience — it is the
 * same film.
 */
function pickSource(): string {
  if (typeof window === "undefined") return "/shower-lite.mp4";
  const c = (navigator as Navigator & { connection?: Conn }).connection;
  // Data Saver and slow links get the small file. This is the only case
  // where resolution is sacrificed, and it is the right one: on 2G the
  // choice is a soft picture or no picture.
  if (c?.saveData) return "/shower-lite.mp4";
  if (c?.effectiveType && /(^|-)2g$|3g/.test(c.effectiveType)) return "/shower-lite.mp4";

  /* Phones get FULL resolution at a lower bitrate, not a smaller picture. A
     390px box on a 3x screen is 1170 real pixels, so a 356-wide file is
     upscaled hard and looks soft; the native 464 is what the panel can
     actually resolve. Bitrate is the axis to give up, not resolution. */
  if (window.innerWidth < 1024) return "/shower-std.mp4";
  return "/shower-hd.mp4";
}

export function HeroFilm() {
  const video = useRef<HTMLVideoElement>(null);
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    /* Attached after first paint, not during it. The headline, the range and
       above all the WhatsApp button should be usable while several megabytes
       of shower are still arriving. */
    const id = window.setTimeout(() => setSrc(pickSource()), 400);
    return () => window.clearTimeout(id);
  }, []);

  /* Pause when the hero leaves the screen. It is the first section, so most
     visitors scroll off it within seconds, and decoding video for a viewport
     nobody is looking at is somebody's battery. */
  useEffect(() => {
    const v = video.current;
    if (!v || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) v.play().catch(() => {});
        else v.pause();
      },
      { threshold: 0.15 },
    );
    io.observe(v);
    return () => io.disconnect();
  }, [src]);

  return (
    /* One element, two boxes. On a phone it fills the viewport edge to edge;
       from `lg` up it becomes a tall panel on the right, held near the film's
       real size so nothing is upscaled and nothing is cropped away. Rendering
       it twice and hiding one would download the video twice. */
    <div
      className="absolute inset-0 overflow-hidden
                 lg:inset-auto lg:right-[6vw] lg:top-1/2 lg:h-[78vh] lg:max-h-[46rem]
                 lg:aspect-[464/832] lg:-translate-y-1/2 lg:rounded-[2rem]
                 lg:border lg:border-hairline lg:shadow-2xl lg:shadow-black/70"
    >
      <video
        ref={video}
        src={src ?? undefined}
        poster="/shower-poster.jpg"
        muted
        loop
        playsInline
        preload="none"
        aria-label="LED rainfall ceiling shower running"
        className="h-full w-full object-cover"
      />
    </div>
  );
}
