/**
 * Every road on this page leads to WhatsApp.
 *
 * A sanitary-ware buyer in Nigeria does not fill in a contact form and wait
 * for an email. They message, they ask the price, they get an answer in
 * minutes. So there is no form anywhere on this site — the form IS WhatsApp,
 * and the only job of every button here is to open it with the right question
 * already typed.
 */

import { whatsappLink } from "@/lib/site";

/** WhatsApp's own glyph, drawn rather than an emoji standing in for an icon. */
export function WhatsAppMark({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884a9.82 9.82 0 016.988 2.896 9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.885-9.885 9.885M20.52 3.449C18.24 1.245 15.24 0 12.045 0 5.463 0 .104 5.359.101 11.945c0 2.096.549 4.142 1.593 5.945L0 24l6.305-1.654a11.95 11.95 0 005.712 1.454h.005c6.585 0 11.946-5.359 11.949-11.945a11.87 11.87 0 00-3.495-8.411" />
    </svg>
  );
}

export function WhatsAppButton({
  message,
  children,
  variant = "solid",
  className = "",
}: {
  message: string;
  children: React.ReactNode;
  variant?: "solid" | "outline";
  className?: string;
}) {
  const base =
    "inline-flex items-center justify-center gap-2.5 rounded-full px-6 py-3.5 " +
    "text-sm font-semibold transition-colors duration-200";
  const styles =
    variant === "solid"
      ? "bg-whatsapp text-white hover:bg-whatsapp-deep"
      : "border border-hairline bg-white text-ink hover:border-ink-soft";

  return (
    <a
      href={whatsappLink(message)}
      target="_blank"
      // noreferrer alongside noopener: the tab we open should not be handed a
      // reference back to this page.
      rel="noopener noreferrer"
      className={`${base} ${styles} ${className}`}
    >
      <WhatsAppMark className="h-[1.15em] w-[1.15em]" />
      {children}
    </a>
  );
}

/**
 * The persistent button. It sits above the fold's CTA and every product's CTA
 * so that wherever someone stops scrolling — halfway down a product, at the
 * bottom, on a slow connection where the 3D never loaded — the way to buy is
 * one thumb-reach away.
 */
export function FloatingWhatsApp({ message }: { message: string }) {
  return (
    <a
      href={whatsappLink(message)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-5 right-5 z-50 inline-flex items-center gap-2.5 rounded-full
                 bg-whatsapp px-5 py-4 text-sm font-semibold text-white shadow-lg
                 shadow-black/15 transition-colors duration-200 hover:bg-whatsapp-deep
                 sm:bottom-8 sm:right-8"
      style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom, 0px))" }}
    >
      <WhatsAppMark className="h-6 w-6" />
      <span className="hidden sm:inline">Chat with us</span>
    </a>
  );
}
