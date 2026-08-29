/**
 * Everything about the business that a non-developer might need to change.
 *
 * Kept in one file on purpose: the owner should be able to update a phone
 * number or add a product without hunting through components.
 */

/* ── Contact ──────────────────────────────────────────────────────────────
 * WhatsApp needs the number in full international form, digits only, with NO
 * leading + and no spaces. Nigeria is country code 234 and the local leading
 * 0 is DROPPED: 0706 494 6102 becomes 2347064946102.
 *
 * Taken from the WhatsApp Business profile itself, which is the one place the
 * number is guaranteed to be the one that actually receives messages.
 */
export const WHATSAPP_NUMBER = "2347064946102";

export const BUSINESS = {
  name: "ONEWITHGOD",
  legalName: "ONEWITHGOD Current Bathroom Lodge Ltd.",
  initials: "OCBL",
  tagline: "Bathroom & sanitary ware",
  /** Shown to humans; formatted for reading, not for dialling. */
  phoneDisplay: "+234 706 494 6102",
  headOffice: "223 Ikwerre Road, Mile 3, Port Harcourt",
  showroom: "Eketa Plaza, opposite Environmental Office, Port Harcourt",
  location: "Port Harcourt, Nigeria",
  /** From the WhatsApp Business profile. */
  hours: "7:30am – 6:00pm",
  /** Named on the shopfront banner. A distributor's brands are its
   *  credentials in this trade — buyers ask for them by name. */
  brands: [
    "Sweethome", "Maxilon", "Esca Standard", "Harmony", "M-Mat", "Rejoice", "Pure",
  ],
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

export const PRODUCTS: Product[] = [
  {
    id: "shadow-suite",
    name: "Sweethome SHADOW suite",
    blurb:
      "Square close-coupled WC and matching pedestal basin. The set in the hero, fitted.",
    image: "/products/shadow-suite.jpg",
  },
  {
    id: "shadow-showroom",
    name: "SHADOW WC and basin, in stock",
    blurb:
      "Photographed on the showroom floor at Mile 3. Ready to collect or be delivered.",
    image: "/products/shadow-showroom.jpg",
  },
];
