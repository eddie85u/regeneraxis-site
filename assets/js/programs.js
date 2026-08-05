import { currentLang, BOOKING_URL, refreshReveal } from "./main.js";
import { loadLocale, DATA_BASE, get } from "./i18n.js";

async function loadPrograms() {
  const res = await fetch(`${DATA_BASE}programs.json`);
  if (!res.ok) throw new Error("programs load failed");
  return res.json();
}

/* Slugs differ per locale: Spanish pages live at the root under Spanish
   slugs, English ones under /en/ with English slugs. */
export function slugFor(prog, lang) {
  const s = prog.slug;
  return typeof s === "string" ? s : s[lang] || s.en;
}

/* Build one preview card. Text comes from locale under programs.items.<id>.
   The bridge line is the searchable outcome phrasing under the brand name. */
function previewCard(prog, dict, lang) {
  const t = get(dict, `programs.items.${prog.id}`) || {};
  const ctaLabel = get(dict, "programs.learn") || "Explore program";
  const a = document.createElement("a");
  a.className = "card card--link reveal";
  a.href = `./${slugFor(prog, lang)}.html`;
  a.innerHTML = `
    <div class="card__num">${prog.number}</div>
    <h3>${t.name || prog.id}</h3>
    ${t.bridge ? `<p class="card__bridge">${t.bridge}</p>` : ""}
    <p>${t.tagline || ""}</p>
    <span class="card__cta">${ctaLabel} &rarr;</span>
  `;
  return a;
}

/* The 6th grid cell: a gold CTA card that balances the 2x3 layout and carries
   the primary booking action (replacing the standalone CTA strip below). */
function ctaCard(dict) {
  const label = get(dict, "cta.book") || "Book Your Assessment";
  const a = document.createElement("a");
  a.className = "card card--cta reveal";
  a.setAttribute("data-booking", "");
  a.href = BOOKING_URL;
  a.innerHTML = `
    <h3>${get(dict, "programs.ctaTitle") || ""}</h3>
    <p>${get(dict, "programs.ctaBody") || ""}</p>
    <span class="card__cta">${label} &rarr;</span>
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
  mount.appendChild(ctaCard(dict));
  refreshReveal();
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
  const note = get(dict, "program.investmentNote") || "Final pricing depends on your initial assessment and personalization.";
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
  const signals = (t.signals || []).map((s) => `<li>${s}</li>`).join("");
  const phases = (t.phases || [])
    .map((p) => `<div class="step"><div class="step__n"></div><div><h3>${p.t || ""}</h3><p>${p.b || ""}</p></div></div>`)
    .join("");
  const doping = prog.antiDoping
    ? `<p class="doping-note">${get(dict, "program.doping") || ""}</p>`
    : "";
  const cta = get(dict, "cta.book") || "Book Your Assessment";
  const L = (k, f) => get(dict, k) || f;
  const supportCard = (k) => {
    const s = get(dict, `program.support.${k}`) || {};
    return `<article class="card"><h3>${s.t || ""}</h3><p>${s.b || ""}</p></article>`;
  };

  /* SEO: the brand name stays the H1, but the title and description lead with
     the bridge term, which is what people actually search for. */
  const entity = get(dict, "brand.entity") || "";
  document.title = t.bridge
    ? `${t.name || id} · ${t.bridge} · RegenerAxis`
    : `${t.name || id} · RegenerAxis`;
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.setAttribute("content", `${t.bridge || t.tagline || ""} ${t.hook || ""}`.trim());
  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) ogTitle.setAttribute("content", `${t.name || id} · RegenerAxis`);
  const ogDesc = document.querySelector('meta[property="og:description"]');
  if (ogDesc) ogDesc.setAttribute("content", t.tagline || "");

  /* Optional aesthetic complements. Only Longevity carries these today, so the
     block renders solely when the locale defines it. */
  const complements = t.complements
    ? `<div class="note-block reveal">
         <span class="kicker">${t.complementsTitle || ""}</span>
         <p>${t.complements}</p>
       </div>`
    : "";

  mount.innerHTML = `
    <section class="hero hero--program stage--night">
      <div class="hero__aurora" aria-hidden="true"><span></span><span></span><span></span></div>
      <div class="wrap hero__inner reveal">
        <span class="kicker">${t.kicker || ""}${entity ? ` · ${entity}` : ""}</span>
        <h1>${t.name || id}</h1>
        ${t.bridge ? `<p class="hero__bridge">${t.bridge}</p>` : ""}
        <p class="subline">${t.hook || ""}</p>
        <div class="btn-row"><a class="btn btn--dark" data-booking href="#booking-placeholder">${cta}</a></div>
      </div>
    </section>

    <section class="section stage--bone"><div class="wrap narrow reveal">
      ${t.outcome ? `<span class="kicker">${L("program.outcomeKicker", "What you are after")}</span>
        <p class="outcome-line">${t.outcome}</p>` : ""}
      <span class="kicker">${L("program.whatItDoes", "What it does in your body")}</span>
      <p>${t.body || ""}</p>
      <ul class="benefits">${benefits}</ul>
      ${complements}
    </div></section>

    <section class="section stage--graphite"><div class="wrap reveal">
      <div class="grid grid--2">
        <div>
          <span class="kicker">${L("program.signalsTitle", "Does this sound like you?")}</span>
          <ul class="benefits">${signals}</ul>
        </div>
        <div>
          <span class="kicker">${L("program.candidateTitle", "Ideal candidate")}</span>
          <p>${t.idealFor || ""}</p>
          <span class="kicker" style="margin-top:1.6rem">${L("program.eligibilityTitle", "Before you start")}</span>
          <p>${L("program.eligibilityBody", "")}</p>
        </div>
      </div>
    </div></section>

    <section class="section stage--night"><div class="wrap narrow reveal">
      <div class="eyebrow-center" style="text-align:left">
        <span class="kicker">${L("program.timelineKicker", "The 90-day journey")}</span>
        <h2>${L("program.timelineTitle", "How your program unfolds")}</h2>
      </div>
      <div class="steps reveal-stagger">${phases}</div>
      <p class="tst-note">${L("program.timelineNote", "")}</p>
    </div></section>

    <section class="section stage--olive"><div class="wrap narrow reveal">
      <div class="grid grid--2">
        <div>
          <span class="kicker">${L("program.schema", "Schema & cycle")}</span>
          <p>${t.schema || ""}</p>
          ${doping}
        </div>
        <div>${priceLine(prog, dict)}</div>
      </div>
    </div></section>

    <section class="section stage--ivory"><div class="wrap reveal">
      <div class="narrow center eyebrow-center">
        <span class="kicker">${L("program.supportKicker", "Integrated support (optional)")}</span>
        <h2>${L("program.supportTitle", "You can amplify your program")}</h2>
      </div>
      <div class="grid grid--3 reveal-stagger">
        ${supportCard("nutrition")}${supportCard("exercise")}${supportCard("therapy")}
      </div>
    </div></section>

    <section class="section stage--night"><div class="wrap narrow center reveal">
      <ul class="expect" aria-label="What to expect">
        <li><span class="kicker">${L("expect.a.k","What it includes")}</span><p>${L("expect.a.body","")}</p></li>
        <li><span class="kicker">${L("expect.b.k","How long it takes")}</span><p>${L("expect.b.body","")}</p></li>
        <li><span class="kicker">${L("expect.c.k","From anywhere")}</span><p>${L("expect.c.body","")}</p></li>
      </ul>
      <div class="gateway reveal">
        <p class="gateway__statement">${L("program.gatewayStatement", "")}</p>
        ${payStrip(dict)}
        <div class="btn-row" style="justify-content:center"><a class="btn" data-booking href="#booking-placeholder">${L("program.gatewayCta", cta)}</a></div>
        <p class="tst-note">${L("program.resultsVary","Guided by certified professional personnel. Individual results vary.")}</p>
      </div>
    </div></section>
  `;

  // Re-wire the newly injected booking buttons.
  document.querySelectorAll("[data-booking]").forEach((el) => el.setAttribute("href", BOOKING_URL));
  // The whole page was injected after the initial reveal pass, so (re)observe it
  // now — otherwise every .reveal element stays at opacity:0 and the page looks empty.
  refreshReveal();
  document.dispatchEvent(new CustomEvent("program:rendered"));
}

document.addEventListener("locale:ready", () => {
  renderPreview();
  renderProgramPage();
});
