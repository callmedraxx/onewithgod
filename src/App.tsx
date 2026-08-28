import { lazy, Suspense } from "react";
import { FloatingWhatsApp, WhatsAppButton, WhatsAppMark } from "@/components/WhatsApp";
import {
  BUSINESS, GENERAL_ENQUIRY, PRODUCTS, productEnquiry, whatsappLink,
} from "@/lib/site";

/* The showroom is ~900kB of three.js. This audience is largely on mobile
   data, so it is split out and loaded after the page: the headline, the range
   and — above all — the WhatsApp button all work while it is still arriving,
   and on a connection too slow to ever finish it, the site still sells. The
   3D is an enhancement to the shop, not the shop. */
const Showroom = lazy(() =>
  import("@/components/Showroom").then((m) => ({ default: m.Showroom })),
);

const CATEGORIES = [
  {
    name: "Toilets & WCs",
    detail: "Close-coupled, wall-hung and squat pans, with cisterns and fittings to match.",
  },
  {
    name: "Washbasins & sinks",
    detail: "Pedestal basins, counter-top bowls and kitchen sinks in matched suites.",
  },
  {
    name: "Showers & taps",
    detail: "Rainfall sets, mixers and faucets — chrome and black finishes that survive hard water.",
  },
  {
    name: "Baths & jacuzzis",
    detail: "Corner and freestanding tubs, whirlpool units, and the plumbing to run them.",
  },
  {
    name: "Water heaters",
    detail: "Storage and instant heaters sized for a flat, a duplex or a whole block.",
  },
  {
    name: "Accessories & fittings",
    detail: "Towel rails, mirrors, seat covers, waste pipes and everything between.",
  },
];

function Header() {
  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-hairline/60 bg-void/70 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4">
        <div className="min-w-0">
          <span className="display text-xl">
            {BUSINESS.name}
          </span>
          <span className="ml-2 hidden truncate text-xs text-chalk-soft sm:inline">
            Current Bathroom Lodge · Port Harcourt
          </span>
        </div>
        <a
          href="#range"
          className="shrink-0 text-sm text-chalk-soft transition-colors hover:text-chalk"
        >
          See the range
        </a>
      </div>
    </header>
  );
}

/**
 * The hero is a full viewport of showroom with the copy laid over it.
 *
 * The canvas is sticky and the copy scrolls across it, so the product stays
 * lit and present while the argument is made — the room does not scroll away
 * the moment someone starts reading.
 */
function Hero() {
  return (
    <section className="relative">
      <div className="sticky top-0 h-[100svh] w-full">
        <Suspense
          fallback={
            /* Not a spinner. The room's own colour, so nothing flashes and
               the layout never jumps when the canvas takes over. */
            <div className="h-full w-full bg-void" />
          }
        >
          <Showroom />
        </Suspense>
        {/* The floor of the 3D room fades into the page, so the canvas has no
            visible bottom edge and the section below reads as the same space
            rather than a different one. */}
        {/* Two jobs. It fades the 3D floor into the page so the canvas has
            no visible bottom edge — and on a phone, where the product and the
            copy share one column, it is what the text is legible against. */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[62%]
                        bg-gradient-to-t from-void via-void/92 to-transparent
                        sm:h-40 sm:via-transparent" />
      </div>

      <div className="pointer-events-none relative -mt-[100svh] min-h-[100svh]">
        <div className="mx-auto flex min-h-[100svh] max-w-6xl flex-col justify-end px-5 pb-16 pt-28
                        sm:justify-center sm:pb-24">
          <div className="max-w-xl">
            <h1 className="display text-[3.4rem] [text-shadow:0_4px_40px_rgba(0,0,0,0.75)]
                           sm:text-[5.5rem] lg:text-[7rem]">
              The whole
              <br />
              bathroom.
              <br />
              <span className="text-gold">One supplier.</span>
            </h1>
            <p className="mt-5 max-w-md text-base leading-relaxed text-chalk-soft
                          [text-shadow:0_1px_14px_rgba(0,0,0,0.7)]">
              Toilets, basins, showers, taps and the fittings that join them.
              Distributors in Port Harcourt, supplying builders, plumbers and
              homeowners. Tell us what you need and we will price it on
              WhatsApp today.
            </p>

            {/* Pointer events are re-enabled only on the controls, so the rest
                of the overlay lets the visitor drag the room behind it. */}
            <div className="pointer-events-auto mt-8 flex flex-wrap items-center gap-3">
              <WhatsAppButton message={GENERAL_ENQUIRY}>
                Message us on WhatsApp
              </WhatsAppButton>
              <a
                href="#range"
                className="inline-flex items-center rounded-full border border-hairline
                           bg-surface/70 px-6 py-3.5 text-sm font-semibold backdrop-blur
                           transition-colors duration-200 hover:border-chalk-soft"
              >
                See the range
              </a>
            </div>

            <p className="mt-5 text-xs text-chalk-soft">
              Open {BUSINESS.hours} · {BUSINESS.headOffice}
            </p>
            <p className="mt-8 text-[10px] uppercase tracking-[0.28em] text-chalk-soft/50">
              Scroll to turn · tap the seat to open
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* Buyers in this trade ask for brands by name, so the shopfront banner lists
   them and so does this. It is the closest thing to a credential a
   distributor has. */
function Brands() {
  return (
    <section className="border-y border-hairline bg-surface/40">
      <div className="mx-auto max-w-6xl px-5 py-10">
        <p className="text-xs uppercase tracking-[0.2em] text-chalk-soft">
          Authorised distributors of
        </p>
        <ul className="mt-4 flex flex-wrap gap-x-8 gap-y-3">
          {BUSINESS.brands.map((b) => (
            <li key={b} className="display text-2xl text-chalk/85">
              {b}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Range() {
  return (
    <section id="range" className="scroll-mt-20">
      <div className="mx-auto max-w-6xl px-5 py-16 lg:py-24">
        <h2 className="display text-5xl sm:text-6xl lg:text-7xl">What we supply</h2>
        <p className="mt-3 max-w-lg text-chalk-soft">
          Everything a bathroom needs, in finishes that match. Fitting a whole
          house? Send the plan and we will price it as one order.
        </p>

        <div className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-hairline
                        bg-hairline sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((c) => (
            <div key={c.name} className="flex flex-col bg-surface p-6">
              <h3 className="display text-2xl">{c.name}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-chalk-soft">{c.detail}</p>
              {/* Per-category, so the chat opens naming what they were
                  reading. "Do you have rainfall showers?" beats "hi". */}
              <a
                href={whatsappLink(
                  `Hello ${BUSINESS.name}, I am looking for ${c.name.toLowerCase()}. What do you have available?`,
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex items-center gap-2 text-sm font-semibold
                           text-gold transition-colors hover:text-gold-deep"
              >
                <WhatsAppMark className="h-4 w-4" />
                Ask about {c.name.toLowerCase()}
              </a>
            </div>
          ))}
        </div>

        {PRODUCTS.length > 0 && (
          <>
            <h2 className="mt-24 display text-5xl sm:text-6xl lg:text-7xl">In stock now</h2>
            <p className="mt-3 max-w-lg text-chalk-soft">
              Photographed on our own floor at Mile 3 — not catalogue pictures
              of things we would have to order in.
            </p>
            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              {PRODUCTS.map((p) => (
                <article
                  key={p.id}
                  className="group overflow-hidden rounded-2xl border border-hairline bg-surface"
                >
                  <div className="aspect-[4/3] overflow-hidden bg-raised">
                    <img
                      src={p.image}
                      alt={p.name}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500
                                 group-hover:scale-[1.04]"
                    />
                  </div>
                  <div className="p-5">
                    <h3 className="display text-xl">{p.name}</h3>
                    <p className="mt-1 text-sm text-chalk-soft">{p.blurb}</p>
                    {p.price && (
                      <p className="mt-2 text-sm font-semibold tabular text-gold">{p.price}</p>
                    )}
                    <WhatsAppButton
                      message={productEnquiry(p.name)}
                      variant="outline"
                      className="mt-4 w-full"
                    >
                      Ask about this
                    </WhatsAppButton>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}

function Contact() {
  return (
    <section className="border-t border-hairline bg-surface/40">
      <div className="mx-auto max-w-6xl px-5 py-16 text-center lg:py-24">
        <h2 className="display text-5xl sm:text-6xl lg:text-7xl">Ready when you are</h2>
        <p className="mx-auto mt-3 max-w-md text-chalk-soft">
          Send a photo of what you need, or of the room you are fitting. We
          will tell you what it costs and how soon it can reach you.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <WhatsAppButton message={GENERAL_ENQUIRY}>Start a WhatsApp chat</WhatsAppButton>
          <a
            href={`tel:+${BUSINESS.phoneDisplay.replace(/\D/g, "")}`}
            className="inline-flex items-center rounded-full border border-hairline bg-surface
                       px-6 py-3.5 text-sm font-semibold tabular transition-colors
                       duration-200 hover:border-chalk-soft"
          >
            {BUSINESS.phoneDisplay}
          </a>
        </div>

        <dl className="mx-auto mt-12 grid max-w-2xl gap-5 text-left sm:grid-cols-2">
          <div className="rounded-2xl border border-hairline bg-surface p-5">
            <dt className="text-xs uppercase tracking-[0.16em] text-chalk-soft">Head office</dt>
            <dd className="mt-1.5 text-sm">{BUSINESS.headOffice}</dd>
          </div>
          <div className="rounded-2xl border border-hairline bg-surface p-5">
            <dt className="text-xs uppercase tracking-[0.16em] text-chalk-soft">Showroom</dt>
            <dd className="mt-1.5 text-sm">{BUSINESS.showroom}</dd>
          </div>
        </dl>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-hairline">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3
                      px-5 py-8 text-sm text-chalk-soft sm:flex-row">
        <span className="display text-base text-chalk">{BUSINESS.legalName}</span>
        <span>Open {BUSINESS.hours} · {BUSINESS.location}</span>
        <a
          href={`tel:+${BUSINESS.phoneDisplay.replace(/\D/g, "")}`}
          className="tabular transition-colors hover:text-chalk"
        >
          {BUSINESS.phoneDisplay}
        </a>
      </div>
    </footer>
  );
}

export default function App() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        {/* Everything below the hero rides on its own opaque ground, so it
            scrolls over the sticky canvas instead of letting the room show
            through behind the copy. */}
        <div className="relative z-10 bg-void">
          <Brands />
          <Range />
          <Contact />
          <Footer />
        </div>
      </main>
      <FloatingWhatsApp message={GENERAL_ENQUIRY} />
    </>
  );
}
