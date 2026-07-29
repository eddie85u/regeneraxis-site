# RegenerAxis

Bilingual (English default / Spanish mirror) marketing website for RegenerAxis, a premium
regenerative medicine and human optimization center in Medellin, Colombia.

Pure static site: HTML, CSS, and a small amount of vanilla JS (ES modules). No framework,
no build step, no backend. Deploys to GitHub Pages on a custom domain.

## Structure

```
/                         Root language router (redirects to /en/ or /es/)
/en/                      English site (default)
  index.html              Home = the funnel
  faq.html                FAQ (data-driven accordion + FAQPage schema)
  contact.html            Contact form + phone + remote-consult note
  testimonials.html       Filterable, data-driven testimonials grid
  privacy.html            Privacy policy placeholder
  <program>.html          5 program pages, rendered from data by programs.js
/es/                      Spanish mirror (identical structure)
/assets/
  css/styles.css          Brand style system (dark default, full light/dark flip)
  js/                     main, i18n, programs, faq, testimonials, contact (ES modules)
  img/                    Logos, favicon (add hero.jpg and og.jpg placeholders)
  favicon.svg
/data/
  en.json, es.json        Locale strings (no hardcoded copy in HTML beyond fallbacks)
  programs.json           Program metadata (id, slug, number, priceFrom, antiDoping)
  faq.json                All FAQ entries (lang, order, category, question, answer)
  testimonials.json       All testimonials (lang, name, country, program, quote)
404.html, robots.txt, sitemap.xml, CNAME
COMPLIANCE.md             Claims / advertising compliance guide (read before editing copy)
COPY_EN.md, COPY_ES.md    Human-readable source copy
```

## Key conventions

- **One CTA everywhere.** Every booking button carries `data-booking`. The scheduling URL is a
  single constant, `BOOKING_URL` in `assets/js/main.js`. Swap that one value (currently
  `#booking-placeholder`) when the Calendly / Cal.com / payment link is ready. Do not hardcode
  booking URLs anywhere else.
- **i18n.** No user-facing string is hardcoded (HTML text is only a no-JS/SEO fallback). Elements
  carry `data-i18n="dot.path"` resolved against `data/<lang>.json`; `data-i18n-html` allows inline
  markup; `data-i18n-attr="attr:key"` localizes attributes. Language is derived from `<html lang>`.
- **Content scales without touching layout.** Add a program to `programs.json` + its strings to both
  locales; add an FAQ by adding one object to `faq.json`; add a testimonial to `testimonials.json`.
- **Theme.** Dark is the default. The toggle persists to `localStorage` (`ra_theme`). An inline script
  in each `<head>` sets the theme before paint to avoid a flash.
- **Language memory.** The EN/ES toggle and the root router persist choice to `localStorage`
  (`ra_lang`).
- **Compliance.** All copy follows `COMPLIANCE.md`: outcomes not molecules, process-based claims,
  no promised results, and no em dashes in either language.

## Local development

The site uses ES modules and `fetch`, so it must be served over HTTP (not opened as `file://`).
From the repository root:

```bash
# Python 3
python -m http.server 8000
# or Node
npx serve .
```

Then open http://localhost:8000/ (redirects to /en/). Test /en/ and /es/, the theme toggle,
the language toggle, and the FAQ deep links (e.g. /en/faq.html#q-how-do-i-book).

## Deployment (GitHub Pages)

1. Push to `main`. The workflow in `.github/workflows/deploy.yml` publishes the repository root
   to GitHub Pages (no build step). `CNAME` (`regeneraxis.com`) is included so the custom domain
   persists across deploys.
2. In the repository settings, set Pages source to **GitHub Actions** (one-time).
3. Point the `regeneraxis.com` DNS to GitHub Pages and confirm the custom domain in settings.

## TODO before launch

- Replace `BOOKING_URL` in `assets/js/main.js` with the real paid scheduling link.
- Replace the Formspree placeholder endpoint (`your-form-id`) in both `contact.html` files.
- Add real imagery: `assets/img/hero.jpg` (hero) and `assets/img/og.jpg` (Open Graph, 1200x630).
- Fill the `[to be defined]` FAQ answers (reschedule window, payment methods, refund policy).
- Have a Colombian health-regulatory lawyer review all copy and the privacy policy.
- Enable the WhatsApp CTA when ready (number: +57 313 8750104).
