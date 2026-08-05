/* RegenerAxis — the "Cómo funciona" method section.
 *
 * Renders the four beats from the locale file, then optionally pins the
 * section: the stage sticks to the viewport while the page scrolls past a
 * taller track, and the beats light up one at a time.
 *
 * Two deliberate constraints:
 *   1. Progress is derived from the track's position, never accumulated from
 *      scroll events. That means it resolves correctly in both directions and
 *      after a jump (anchor link, refresh mid-page, back button).
 *   2. Nothing preventDefaults or moves the scroll position, so the section
 *      can never trap the reader. Sticky is the only mechanism.
 *
 * Pinning is opt-in per environment: wide viewport and motion allowed.
 * Otherwise the beats simply stack and every one of them is fully legible.
 */
import { loadLocale, get } from "./i18n.js";
import { refreshReveal } from "./main.js";

const PIN_MIN_WIDTH = 900;

function renderBeats(section, dict) {
  const mount = section.querySelector("[data-method-beats]");
  if (!mount) return 0;
  const beats = get(dict, "method.beats") || [];
  mount.innerHTML = beats
    .map(
      (b, i) => `
      <li class="beat" data-beat="${i}">
        <span class="beat__n">${String(i + 1).padStart(2, "0")}</span>
        <div class="beat__body">
          <h3>${b.t || ""}</h3>
          <p>${b.b || ""}</p>
        </div>
      </li>`
    )
    .join("");
  return beats.length;
}

function initMethod(section, count) {
  const track = section.querySelector(".method__track");
  const beats = [...section.querySelectorAll(".beat")];
  if (!track || count < 2) return;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const wide = window.matchMedia(`(min-width: ${PIN_MIN_WIDTH}px)`);
  let pinned = false;

  function setMode() {
    const next = wide.matches && !reduced.matches;
    if (next === pinned) return;
    pinned = next;
    section.classList.toggle("is-pinned", pinned);
    if (pinned) {
      section.style.setProperty("--beat-count", String(count));
      update();
    } else {
      // Unpinned: every beat reads at full strength, no progress driving it.
      section.style.removeProperty("--beat-count");
      section.style.removeProperty("--p");
      beats.forEach((b) => b.classList.add("is-active"));
    }
  }

  function update() {
    if (!pinned) return;
    const rect = track.getBoundingClientRect();
    const travel = rect.height - window.innerHeight;
    if (travel <= 0) return;
    // 0 when the track's top reaches the viewport top, 1 when its bottom does.
    const p = Math.min(1, Math.max(0, -rect.top / travel));
    section.style.setProperty("--p", p.toFixed(4));
    const active = Math.min(count - 1, Math.floor(p * count));
    beats.forEach((b, i) => b.classList.toggle("is-active", i <= active));
  }

  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      update();
    });
  }

  // One listener each, registered once. setMode only flips classes.
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", () => { setMode(); onScroll(); }, { passive: true });
  wide.addEventListener("change", setMode);
  reduced.addEventListener("change", setMode);

  beats.forEach((b) => b.classList.add("is-active")); // safe default
  setMode();
}

let booted = false;
async function boot() {
  if (booted) return;
  const section = document.querySelector("[data-method]");
  if (!section) return;
  booted = true;
  const dict = await loadLocale();
  const count = renderBeats(section, dict);
  if (!count) return;
  initMethod(section, count);
  refreshReveal();
}

document.addEventListener("locale:ready", boot);
