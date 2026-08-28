import { lazy, Suspense } from "react";
import { FloatingWhatsApp, WhatsAppButton, WhatsAppMark } from "@/components/WhatsApp";
import {
  BUSINESS, GENERAL_ENQUIRY, HAS_REAL_NUMBER, PRODUCTS, productEnquiry, whatsappLink,
} from "@/lib/site";

/* The 3D showroom is ~900kB of three.js. This audience is largely on mobile
   data, so it is split out and loaded after the page: the headline, the price
   question and — above all — the WhatsApp button all work while it is still
   arriving, and on a connection too slow to ever finish it, the site still
   sells. The 3D is an enhancement to the shop, not the shop. */
const Showroom = lazy(() =>
  import("@/components/Showroom").then((m) => ({ default: m.Showroom })),
);

/* The range, in the order a buyer thinks about a bathroom: the fixture
   first, then what goes around it. */
const CATEGORIES = [
  {
    name: "Toilets & WCs",
    detail: "Water closets, cisterns and squat pans, with the fittings to install them.",
  },
  {
    name: "Washbasins & sinks",
    detail: "Pedestal basins, counter-top bowls and kitchen sinks in matched finishes.",
  },
  {
    name: "Showers & taps",
    detail: "Shower sets, mixers and faucets — chrome that survives hard water.",
  },
  {
    name: "Accessories & fittings",
    detail: "Towel rails, mirrors, seat covers, waste pipes and everything between.",
  },
];

function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-hairline bg-porcelain/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4">
        <div>
          <span className="font-display text-lg font-semibold tracking-tight">
            {BUSINESS.name}
          </span>
          <span className="ml-2 hidden text-xs text-ink-soft sm:inline">
            {BUSINESS.tagline}
          </span>
        </div>
        <a
          href="#range"
          className="text-sm text-ink-soft transition-colors hover:text-ink"
        >
          See the range
        </a>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="mx-auto grid max-w-6xl items-center gap-8 px-5 py-12 lg:grid-cols-2 lg:gap-4 lg:py-20">
      <div className="order-2 lg:order-1">
        <h1 className="font-display text-4xl leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
          The whole bathroom,
          <br />
          from one supplier.
        </h1>
        <p className="mt-5 max-w-md text-base leading-relaxed text-ink-soft">
          Toilets, basins, showers, taps and the fittings that join them —
          supplied across {BUSINESS.location}. Tell us what you need and we
          will quote you on WhatsApp today.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <WhatsAppButton message={GENERAL_ENQUIRY}>
            Message us on WhatsApp
          </WhatsAppButton>
          <a
            href="#range"
            className="inline-flex items-center rounded-full border border-hairline
                       bg-white px-6 py-3.5 text-sm font-semibold transition-colors
                       duration-200 hover:border-ink-soft"
          >
            See the range
          </a>
        </div>

        <p className="mt-4 text-xs text-ink-soft">
          {BUSINESS.hours} · Replies usually within the hour
        </p>
      </div>

      <div className="order-1 lg:order-2">
        <div className="relative aspect-square w-full overflow-hidden rounded-3xl
                        bg-gradient-to-b from-white to-porcelain-deep">
          <Suspense
            fallback={
              /* Not a spinner. A calm plate that already looks like the
                 finished frame, so the layout never jumps when it swaps. */
              <div className="h-full w-full animate-pulse bg-porcelain-deep/60" />
            }
          >
            <Showroom />
          </Suspense>
          <p className="pointer-events-none absolute bottom-4 left-0 right-0 text-center
                        text-[11px] text-ink-soft/70">
            Drag to turn
          </p>
        </div>
        {!HAS_REAL_NUMBER && (
          <p className="mt-3 rounded-xl border border-dashed border-hairline bg-white px-4 py-3
                        text-xs text-ink-soft">
            <strong className="text-ink">Not live yet.</strong> The model above is a
            stand-in, and the WhatsApp number is a placeholder — both are replaced
            before launch.
          </p>
        )}
      </div>
    </section>
  );
}

function Range() {
  return (
    <section id="range" className="border-t border-hairline bg-white">
      <div className="mx-auto max-w-6xl px-5 py-14 lg:py-20">
        <h2 className="font-display text-3xl tracking-tight sm:text-4xl">
          What we supply
        </h2>
        <p className="mt-3 max-w-lg text-ink-soft">
          Everything a bathroom needs, in finishes that match. If you are
          fitting a whole house, send us the plan and we will price it as one
          order.
        </p>

        <div className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-hairline
                        bg-hairline sm:grid-cols-2">
          {CATEGORIES.map((c) => (
            <div key={c.name} className="bg-white p-6">
              <h3 className="font-display text-xl tracking-tight">{c.name}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{c.detail}</p>
              {/* Per-category, so the chat opens naming what they were
                  reading. "Do you have taps?" beats "hi". */}
              <a
                href={whatsappLink(
                  `Hello ${BUSINESS.name}, I am looking for ${c.name.toLowerCase()}. What do you have available?`,
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold
                           text-water transition-colors hover:text-water-deep"
              >
                <WhatsAppMark className="h-4 w-4" />
                Ask about {c.name.toLowerCase()}
              </a>
            </div>
          ))}
        </div>

        {PRODUCTS.length > 0 ? (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {PRODUCTS.map((p) => (
              <article
                key={p.id}
                className="group overflow-hidden rounded-2xl border border-hairline bg-white"
              >
                <div className="aspect-[4/3] overflow-hidden bg-porcelain-deep">
                  <img
                    src={p.image}
                    alt={p.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-300
                               group-hover:scale-[1.03]"
                  />
                </div>
                <div className="p-5">
                  <h3 className="font-display text-lg tracking-tight">{p.name}</h3>
                  <p className="mt-1 text-sm text-ink-soft">{p.blurb}</p>
                  {p.price && (
                    <p className="mt-2 text-sm font-semibold tabular">{p.price}</p>
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
        ) : (
          <div className="mt-12 rounded-2xl border border-dashed border-hairline p-10 text-center">
            <p className="font-medium">Product photographs go here</p>
            <p className="mx-auto mt-1 max-w-sm text-sm text-ink-soft">
              Each one gets its own WhatsApp button that opens the chat with
              that product already named, so the first message is a real
              question rather than “hi”.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

function Contact() {
  return (
    <section className="border-t border-hairline">
      <div className="mx-auto max-w-6xl px-5 py-14 text-center lg:py-20">
        <h2 className="font-display text-3xl tracking-tight sm:text-4xl">
          Ready when you are
        </h2>
        <p className="mx-auto mt-3 max-w-md text-ink-soft">
          Send a photo of what you need or the room you are fitting. We will
          tell you what it costs and how soon it can reach you.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <WhatsAppButton message={GENERAL_ENQUIRY}>
            Start a WhatsApp chat
          </WhatsAppButton>
          <a
            href={`tel:${BUSINESS.phoneDisplay.replace(/\s/g, "")}`}
            className="inline-flex items-center rounded-full border border-hairline bg-white
                       px-6 py-3.5 text-sm font-semibold tabular transition-colors
                       duration-200 hover:border-ink-soft"
          >
            {BUSINESS.phoneDisplay}
          </a>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-hairline bg-white">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3
                      px-5 py-8 text-sm text-ink-soft sm:flex-row">
        <span className="font-display text-base text-ink">{BUSINESS.name}</span>
        <span>{BUSINESS.tagline} · {BUSINESS.location}</span>
        <a
          href={`tel:${BUSINESS.phoneDisplay.replace(/\s/g, "")}`}
          className="tabular transition-colors hover:text-ink"
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
        <Range />
        <Contact />
      </main>
      <Footer />
      <FloatingWhatsApp message={GENERAL_ENQUIRY} />
      {/* Screen readers announce the floating button as the last thing on the
          page; this gives it a name in the document flow too. */}
      <span className="sr-only">
        <WhatsAppMark /> Contact {BUSINESS.name} on WhatsApp
      </span>
    </>
  );
}
