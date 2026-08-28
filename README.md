# ONEWITHGOD

Marketing site for a Nigerian bathroom and sanitary-ware supplier. Every call
to action opens WhatsApp with the enquiry already written.

## Before this goes live

Two things must be replaced, both in `src/lib/site.ts`:

1. **`WHATSAPP_NUMBER`** — full international form, digits only, no `+`, no
   spaces, and the local leading `0` dropped. `0803 123 4567` becomes
   `2348031234567`. Every button on the site leads here, so a typo sends every
   customer to a stranger.
2. **`PRODUCTS`** — one entry per photograph, with images placed in `public/`.

Until the number is set, the site shows a visible "not live yet" notice.

## The 3D model

The hero model is generated from a photograph of the real product using the
[img2threejs](https://github.com/img2threejs/img2threejs) skill, and lives in
`src/components/models/`. `PlaceholderWC.tsx` is a labelled stand-in and must
not ship to customers — it misrepresents the product being sold.

three.js is code-split into its own chunk (`Showroom.tsx`) and loaded after the
page. The audience is largely on mobile data: the headline, the range and the
WhatsApp button all work before any 3D arrives, and on a connection too slow to
finish it, the site still sells.

## Develop

```bash
bun install
bun run dev
bun run build
```
