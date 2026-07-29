import { currentLang, BOOKING_URL } from "./main.js";
import { loadLocale, DATA_BASE, get } from "./i18n.js";

async function loadPrograms() {
  const res = await fetch(`${DATA_BASE}programs.json`);
  if (!res.ok) throw new Error("programs load failed");
  return res.json();
}

/* Build one preview card. Text comes from locale under programs.items.<id>. */
function previewCard(prog, dict, lang) {
  const t = get(dict, `programs.items.${prog.id}`) || {};
  const ctaLabel = get(dict, "programs.learn") || "Explore program";
  const a = document.createElement("a");
  a.className = "card card--link reveal";
  a.href = `./${prog.slug}.html`;
  a.innerHTML = `
    <div class="card__num">${prog.number}</div>
    <h3>${t.name || prog.id}</h3>
    <p>${t.tagline || ""}</p>
    <span class="card__cta">${ctaLabel} &rarr;</span>
  `;
  return a;
}

async function renderPreview() {
  const mount = document.querySelector("[data-programs-preview]");
  if (!mount) return;
  const [programs, dict] = await Promise.all([loadPrograms(), loadLocale()]);
  const lang = currentLang();
  mount.innerHTML = "";
  programs.forEach((p) => mount.appendChild(previewCard(p, dict, lang)));
}

/* Shared payment-reassurance strip. Rendered above final CTAs so objections
   about paying for the assessment are answered before the click. */
export function payStrip(dict) {
  const ic = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6L9 17l-5-5"/></svg>';
  const a = get(dict, "pay.a") || "All major cards accepted";
  const b = get(dict, "pay.b") || "Secure checkout";
  const c = get(dict, "pay.c") || "Quick eligibility check before payment";
  return `<div class="pay-strip" aria-label="Payment">
      <span class="pay-item">${ic}${a}</span>
      <span class="pay-item">${ic}${b}</span>
      <span class="pay-item">${ic}${c}</span>
    </div>`;
}

/* --- Full program page renderer (used by program pages) --- */
function priceLine(prog, dict) {
  if (!prog.priceFrom) return "";
  const label = get(dict, "program.investmentFrom") || "Investment from";
  const note = get(dict, "program.investmentNote") || "Final pricing depends on your medical assessment and personalization.";
  return `
    <div class="price">
      <span class="kicker">${label}</span>
      <div class="price__amount">${prog.priceFrom}</div>
      <p class="tst-note">${note}</p>
    </div>`;
}

async function renderProgramPage() {
  const mount = document.querySelector("[data-program-page]");
  if (!mount) return;
  const id = mount.getAttribute("data-program-page");
  const [programs, dict] = await Promise.all([loadPrograms(), loadLocale()]);
  const prog = programs.find((p) => p.id === id);
  if (!prog) return;
  const t = get(dict, `programs.items.${id}`) || {};

  const benefits = (t.benefits || []).map((b) => `<li>${b}</li>`).join("");
  const doping = prog.antiDoping
    ? `<p class="doping-note">${get(dict, "program.doping") || ""}</p>`
    : "";
  const cta = get(dict, "cta.book") || "Book Your Assessment";
  const L = (k, f) => get(dict, k) || f;

  document.title = `${t.name || id} · RegenerAxis`;

  mount.innerHTML = `
    <section class="hero hero--program">
      <div class="wrap hero__inner reveal">
        <span class="kicker">${t.kicker || ""}</span>
        <h1>${t.name || id}</h1>
        <p class="subline">${t.hook || ""}</p>
        <div class="btn-row"><a class="btn btn--dark" data-booking href="#booking-placeholder">${cta}</a></div>
      </div>
    </section>

    <section class="section"><div class="wrap narrow reveal">
      <span class="kicker">${L("program.whatItDoes", "What it does in your body")}</span>
      <p>${t.body || ""}</p>
    </div></section>

    <section class="section strip-dark"><div class="wrap narrow reveal">
      <span class="kicker">${L("program.benefits", "Benefits")}</span>
      <ul class="benefits">${benefits}</ul>
    </div></section>

    <section class="section"><div class="wrap narrow reveal">
      <div class="grid grid--2">
        <div>
          <span class="kicker">${L("program.idealFor", "Ideal for")}</span>
          <p>${t.idealFor || ""}</p>
        </div>
        <div>
          <span class="kicker">${L("program.schema", "Schema & cycle")}</span>
          <p>${t.schema || ""}</p>
        </div>
      </div>
      ${priceLine(prog, dict)}
      ${doping}
    </div></section>

    <section class="section"><div class="wrap narrow center reveal">
      <ul class="expect" aria-label="What to expect">
        <li><span class="kicker">${L("expect.a.k","What it includes")}</span><p>${L("expect.a.body","")}</p></li>
        <li><span class="kicker">${L("expect.b.k","How long it takes")}</span><p>${L("expect.b.body","")}</p></li>
        <li><span class="kicker">${L("expect.c.k","From anywhere")}</span><p>${L("expect.c.body","")}</p></li>
      </ul>
      <h2>${L("final.title","Your biology deserves a strategy.")}</h2>
      ${payStrip(dict)}
      <div class="btn-row" style="justify-content:center"><a class="btn" data-booking href="#booking-placeholder">${cta}</a></div>
      <p class="tst-note">${L("program.resultsVary","Personalized and physician supervised. Individual results vary.")}</p>
    </div></section>
  `;

  // Re-wire the newly injected booking buttons.
  document.querySelectorAll("[data-booking]").forEach((el) => el.setAttribute("href", BOOKING_URL));
  document.dispatchEvent(new CustomEvent("program:rendered"));
}

document.addEventListener("locale:ready", () => {
  renderPreview();
  renderProgramPage();
});
