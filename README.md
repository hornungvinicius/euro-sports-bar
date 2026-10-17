# Euro Sports & Bar - landing page

Static site (HTML + CSS + JS, GSAP vendored). No build step: open `index.html` through any static server.

```bash
python -m http.server 4173
```

## Before publishing

1. **WhatsApp:** put the official number in `index.html` on `<body data-whatsapp="">`, digits only with country and area code (e.g. `5542XXXXXXXXX`). Until it is set, every CTA scrolls to the contact section and the sport picker says the number is not configured.
2. Confirm the details taken from the brand's own material: address `R. Franco Grillo, 671, Ponta Grossa - PR` (stories) and Instagram `@euro.sportsbar` (court banner).

## Images

Photos come from the Euro Sports Drive library. `tools/images.json` lists each slot (source path, Drive file id, crop). To rebuild the WebP derivatives:

```bash
python tools/build_images.py            # all
python tools/build_images.py hero bar   # some
```

Needs Pillow (`pillow-heif` for HEIC sources). Originals are cached in the system temp folder.

## Structure

- `index.html` - the page (hero, intro, the three sports, CTA band, facility, community, contact, footer)
- `assets/css/styles.css` - tokens at the top, sections in page order, responsive rules at the end
- `assets/js/main.js` - WhatsApp links, sport picker, mobile menu, sticky CTA, GSAP motion (respects `prefers-reduced-motion`; content is visible without JS)
- `assets/brand/` - wordmark from `Briefing/LOGO_EURO.pdf` (white and navy) and icons
- `assets/fonts/` - Archivo variable (SIL OFL 1.1)
- `PRODUCT.md` - brand and product context used for design decisions
