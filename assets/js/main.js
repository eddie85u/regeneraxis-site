/* RegenerAxis — shared site behavior. Tiny, no dependencies. */

// Single source of truth for the paid scheduling link.
// Swap this one value when the Calendly / Cal.com / payment URL is ready.
export const BOOKING_URL = "#booking-placeholder";

// WhatsApp: one number, one place. wa.me opens the chat directly on web and
// mobile (unlike a tel: link). Swap the number here if it ever changes.
export const WHATSAPP_NUMBER = "573138750104";
const WHATSAPP_TEXT = {
  es: "Hola, quiero información sobre los programas de RegenerAxis.",
  en: "Hello, I would like information about the RegenerAxis programs.",
};
export function whatsappURL(lang) {
  const t = WHATSAPP_TEXT[lang] || WHATSAPP_TEXT.es;
  return "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(t);
}

export function currentLang() {
  return document.documentElement.lang === "es" ? "es" : "en";
}

function persistLangFromPath() {
  // Spanish lives at the root; English under /en/. Only an /en/ path is English.
  const lang = window.location.pathname.includes("/en/") ? "en" : "es";
  try { localStorage.setItem("ra_lang", lang); } catch (e) {}
}

/* ---- Theme (dark default, remembered) ---- */
function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  try { localStorage.setItem("ra_theme", theme); } catch (e) {}
}
function initTheme() {
  let saved = "dark";
  try { saved = localStorage.getItem("ra_theme") || "dark"; } catch (e) {}
  document.documentElement.setAttribute("data-theme", saved);
  const btn = document.getElementById("theme-toggle");
  if (!btn) return;
  btn.addEventListener("click", () => {
    const next = document.documentElement.getAttribute("data-theme") === "light" ? "dark" : "light";
    applyTheme(next);
  });
}

/* ---- Header scroll state ---- */
function initHeader() {
  const header = document.querySelector(".site-header");
  if (!header) return;
  const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 24);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
}

/* ---- Mobile nav toggle ---- */
function initNavToggle() {
  const nav = document.querySelector(".nav");
  const btn = document.querySelector(".nav__toggle");
  if (!nav || !btn) return;
  btn.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    btn.setAttribute("aria-expanded", String(open));
  });
  nav.querySelectorAll(".nav__links a").forEach((a) =>
    a.addEventListener("click", () => nav.classList.remove("open"))
  );
}

/* ---- Wire every CTA to BOOKING_URL ---- */
function initBookingLinks() {
  document.querySelectorAll("[data-booking]").forEach((el) => {
    el.setAttribute("href", BOOKING_URL);
  });
}

/* ---- WhatsApp: wire [data-whatsapp] links + inject the floating button ---- */
function initWhatsApp() {
  const lang = currentLang();
  const url = whatsappURL(lang);
  document.querySelectorAll("[data-whatsapp]").forEach((el) => {
    el.setAttribute("href", url);
    el.setAttribute("target", "_blank");
    el.setAttribute("rel", "noopener");
  });

  if (document.querySelector(".wa-fab")) return; // avoid duplicates
  const a = document.createElement("a");
  a.className = "wa-fab";
  a.href = url;
  a.target = "_blank";
  a.rel = "noopener";
  a.setAttribute(
    "aria-label",
    lang === "es" ? "Escríbenos por WhatsApp" : "Message us on WhatsApp"
  );
  a.innerHTML =
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38c1.45.79 3.08 1.21 4.79 1.21h.01c5.46 0 9.91-4.45 9.91-9.91C21.96 6.45 17.5 2 12.04 2zm0 18.15h-.01c-1.53 0-3.02-.41-4.32-1.19l-.31-.18-3.21.84.86-3.13-.2-.32a8.2 8.2 0 0 1-1.26-4.36c0-4.54 3.7-8.23 8.25-8.23 2.2 0 4.27.86 5.83 2.42a8.18 8.18 0 0 1 2.41 5.82c0 4.54-3.7 8.23-8.24 8.23zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.25-.64.81-.79.97-.14.16-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.14.16-.25.25-.41.08-.16.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.43l-.48-.01c-.16 0-.43.06-.65.31-.22.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.16 1.74 2.66 4.22 3.73.59.25 1.05.4 1.41.52.59.19 1.13.16 1.56.1.47-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.11-.22-.17-.47-.29z"/></svg>';
  document.body.appendChild(a);
}

/* ---- IntersectionObserver reveal ---- */
function initReveal() {
  const els = document.querySelectorAll(".reveal, .reveal-stagger");
  if (!("IntersectionObserver" in window) || !els.length) {
    els.forEach((el) => el.classList.add("in"));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
  );
  els.forEach((el) => io.observe(el));
}

// Re-run reveal after data-driven grids inject content.
export function refreshReveal() { initReveal(); }

export function boot() {
  initTheme();
  persistLangFromPath();
  initHeader();
  initNavToggle();
  initBookingLinks();
  initWhatsApp();
  initReveal();
}

document.addEventListener("DOMContentLoaded", boot);
