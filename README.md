# RegenerAxis

Bilingual (Spanish default / English mirror) marketing website for RegenerAxis, a premium
regenerative medicine and human optimization center in Medellin, Colombia.

Pure static site: HTML, CSS, and a small amount of vanilla JS (ES modules). No framework,
no build step, no backend. Deploys to GitHub Pages on a custom domain.

## Structure

```
/                         Root language router (Spanish default; English if the browser is English)
/es/                      Spanish site (primary)
  index.html              Home = the funnel
  faq.html                FAQ (data-driven accordion + FAQPage schema)
  contact.html            Contact form + WhatsApp + remote-consult note
  testimonials.html       Filterable, data-driven testimonials grid (text + optional video)
  privacy.html            Privacy policy (rendered from locale)
  <program>.html          5 program pages, rendered from data by programs.js
/en/                      English mirror (identical structure)
/assets/
  css/styles.css          Brand style system (true light / true dark, no inverted strips)
  js/                     main, i18n, programs, faq, testimonials, contact (ES modules)
  img/                    Logos, favicon (add og.jpg for social previews)
  favicon.svg
/data/
  en.json, es.json        Locale strings (no hardcoded copy in HTML beyond fallbacks)
  programs.json           Program metadata (id, slug, number, priceFrom, antiDoping)
  faq.json                All FAQ entries (lang, order, category, question, answer)
  testimonials.json       All testimonials (lang, name, country, program, quote, optional youtube)
404.html, robots.txt, sitemap.xml, CNAME
```

> `COMPLIANCE.md` and `COPY_EN.md` / `COPY_ES.md` are kept **local only** (untracked via
> `.gitignore`) so they are not published with the site. They remain on disk as working guides.

## Key conventions

- **One CTA everywhere.** Every booking button carries `data-booking`. The scheduling URL is a
  single constant, `BOOKING_URL` in `assets/js/main.js` (currently `#booking-placeholder`). Swap
  that one value when the Calendly / Cal.com / payment link is ready. Do not hardcode booking URLs.
- **WhatsApp.** One number lives in `WHATSAPP_NUMBER` in `assets/js/main.js`. `main.js` wires every
  `[data-whatsapp]` link to a `wa.me` chat deep link (with a prefilled, localized message) and
  injects the floating WhatsApp button on every page.
- **i18n.** No user-facing string is hardcoded (HTML text is only a no-JS/SEO fallback). Elements
  carry `data-i18n="dot.path"` resolved against `data/<lang>.json`; `data-i18n-html` allows inline
  markup; `data-i18n-attr="attr:key"` localizes attributes. Language is derived from `<html lang>`.
- **Language.** Spanish is primary. The root router sends English-language browsers to `/en/` and
  everyone else to `/es/`, and remembers the visitor's choice in `localStorage` (`ra_lang`). The
  EN/ES toggle is always available.
- **Theme.** Dark is the default; light and dark are each internally consistent (no section inverts
  against the page). The toggle persists to `localStorage` (`ra_theme`) and an inline `<head>`
  script sets it before paint to avoid a flash. Contrast is checked for WCAG AA in both modes.
- **Hero.** Pure-CSS aurora wash plus a breathing Axis Bloom SVG. No image dependency; honors
  `prefers-reduced-motion`.
- **Content scales without touching layout.** Add a program to `programs.json` + strings in both
  locales; add an FAQ by adding one object to `faq.json`; add a testimonial (text or `youtube` ID)
  to `testimonials.json`.
- **Copy style.** Outcome-led and physician-supervised framing; no em dashes in either language.

## Local development

The site uses ES modules and `fetch`, so it must be served over HTTP (not opened as `file://`).
From the repository root:

```bash
# Python 3
python -m http.server 8000
# or Node
npx serve .
```

Then open http://localhost:8000/ (redirects to /es/). Test /es/ and /en/, the theme toggle,
the language toggle, the WhatsApp button, and FAQ deep links (e.g. /es/faq.html#q-como-agendo).

## Deployment (GitHub Pages)

1. Push to `main`. The workflow in `.github/workflows/deploy.yml` publishes the repository root
   to GitHub Pages (no build step). `CNAME` (`regeneraxis.com`) is included so the custom domain
   persists across deploys.
2. In the repository settings, set Pages source to **GitHub Actions** (one-time).
3. Point the `regeneraxis.com` DNS to GitHub Pages and confirm the custom domain in settings.

## Before launch

- Replace `BOOKING_URL` in `assets/js/main.js` with the real paid scheduling / payment link
  (the flow: eligibility form, then payment, then scheduling).
- Replace the Formspree placeholder endpoint (`your-form-id`) in both `contact.html` files, or swap
  the contact form for your provider's embed.
- Add `assets/img/og.jpg` (1200x630) for link/social previews.
- Confirm the phone/WhatsApp number, prices, and payment/refund policy text match your operations.
- Confirm `WHATSAPP_NUMBER` and the served cities are current.
