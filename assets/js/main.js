/* RegenerAxis — shared site behavior. Kept tiny, no dependencies. */

// Single source of truth for the paid scheduling link.
// Swap this one value when the Calendly/Cal.com/payment URL is ready.
export const BOOKING_URL = "#booking-placeholder";

/* ---- Language helpers ---- */
export function currentLang() {
  return document.documentElement.lang === "es" ? "es" : "en";
}

function persistLangFromPath() {
  const lang = window.location.pathname.includes("/es/") ? "es" : "en";
  try { localStorage.setItem("ra_lang", lang); } catch (e) {}
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

export function boot() {
  persistLangFromPath();
  initHeader();
  initNavToggle();
  initBookingLinks();
  initReveal();
}

document.addEventListener("DOMContentLoaded", boot);
