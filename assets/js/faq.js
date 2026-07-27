import { currentLang } from "./main.js";
import { loadLocale, DATA_BASE, get } from "./i18n.js";

async function loadFaq() {
  const res = await fetch(`${DATA_BASE}faq.json`);
  if (!res.ok) throw new Error("faq load failed");
  return res.json();
}

function slug(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 60);
}

function item(q) {
  const d = document.createElement("details");
  d.className = "faq-item";
  d.id = "q-" + slug(q.question);
  d.innerHTML = `<summary>${q.question}</summary><div class="faq-item__body"><p>${q.answer}</p></div>`;
  return d;
}

async function renderTeaser() {
  const mount = document.querySelector("[data-faq-teaser]");
  if (!mount) return;
  const all = await loadFaq();
  const lang = currentLang();
  all.filter((q) => q.lang === lang)
    .sort((a, b) => (a.order || 0) - (b.order || 0))
    .slice(0, 5)
    .forEach((q) => mount.appendChild(item(q)));
}

async function renderFull() {
  const mount = document.querySelector("[data-faq-full]");
  if (!mount) return;
  const [all, dict] = await Promise.all([loadFaq(), loadLocale()]);
  const lang = currentLang();
  const list = all.filter((q) => q.lang === lang).sort((a, b) => (a.order || 0) - (b.order || 0));

  const cats = [...new Set(list.map((q) => q.category))];
  mount.innerHTML = "";
  cats.forEach((cat) => {
    const wrap = document.createElement("div");
    wrap.className = "faq-cat";
    const h = document.createElement("h3");
    h.textContent = cat;
    wrap.appendChild(h);
    list.filter((q) => q.category === cat).forEach((q) => wrap.appendChild(item(q)));
    mount.appendChild(wrap);
  });

  // FAQPage schema for SEO
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: list.map((q) => ({
      "@type": "Question",
      name: q.question,
      acceptedAnswer: { "@type": "Answer", text: q.answer },
    })),
  };
  const s = document.createElement("script");
  s.type = "application/ld+json";
  s.textContent = JSON.stringify(schema);
  document.head.appendChild(s);

  // Open a question if the URL has its anchor (for WhatsApp deep links).
  if (location.hash) {
    const target = document.getElementById(location.hash.slice(1));
    if (target && target.tagName === "DETAILS") { target.open = true; target.scrollIntoView(); }
  }
}

document.addEventListener("locale:ready", () => {
  renderTeaser();
  renderFull();
});
