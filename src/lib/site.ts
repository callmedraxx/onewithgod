/**
 * Everything about the business that a non-developer might need to change.
 *
 * Kept in one file on purpose: the owner should be able to update a phone
 * number or add a product without hunting through components.
 */

/* ── Contact ──────────────────────────────────────────────────────────────
 * WhatsApp needs the number in full international form, digits only, with NO
 * leading + and no spaces. Nigeria is country code 234, and the local leading
 * 0 is DROPPED: 0803 123 4567 becomes 2348031234567.
 *
 * ⚠️ PLACEHOLDER — replace with the real number before this goes live.
 * A wrong number here is worse than no site at all: every button on the page
 * leads here, so a typo sends every customer to a stranger.
 */
export const WHATSAPP_NUMBER = "2340000000000";

/** True once a real number has been set, used to hard-fail loudly in dev. */
export const HAS_REAL_NUMBER = WHATSAPP_NUMBER !== "2340000000000";

export const BUSINESS = {
  name: "ONEWITHGOD",
  tagline: "Bathroom & sanitary ware",
  /** Shown to humans; formatted for reading, not for dialling. */
  phoneDisplay: "+234 000 000 0000",
  location: "Nigeria",
  hours: "Mon – Sat, 8am – 6pm",
} as const;

/**
 * Builds a WhatsApp deep link that opens the chat with a message already
 * typed. wa.me works on phones and desktop alike and needs no app SDK.
 *
 * The prefilled text matters more than it looks: a buyer who taps through
 * with the product name already in the box asks a specific question, and the
 * seller answers a specific question. An empty chat box gets abandoned.
 */
export function whatsappLink(message?: string): string {
  const base = `https://wa.me/${WHATSAPP_NUMBER}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export function productEnquiry(productName: string): string {
  return `Hello ${BUSINESS.name}, I saw the ${productName} on your website. Is it available, and what is the price?`;
}

export const GENERAL_ENQUIRY =
  `Hello ${BUSINESS.name}, I would like to ask about your bathroom fittings.`;

/* ── Catalogue ────────────────────────────────────────────────────────────
 * Filled in from the photographs the owner supplies. `image` is a path under
 * /public. Keep `name` exactly as the owner would say it on the phone — it is
 * what gets pasted into the WhatsApp message.
 */
export interface Product {
  id: string;
  name: string;
  blurb: string;
  image: string;
  /** Optional: only shown when set, because a wrong price loses trust. */
  price?: string;
}

export const PRODUCTS: Product[] = [];
