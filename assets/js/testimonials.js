import { currentLang } from "./main.js";
import { loadLocale, DATA_BASE, get } from "./i18n.js";

async function loadTestimonials() {
  const res = await fetch(`${DATA_BASE}testimonials.json`);
  if (!res.ok) throw new Error("testimonials load failed");
  return res.json();
}

function card(t) {
  const el = document.createElement("figure");
  el.className = "tst reveal";
  el.innerHTML = `
    <blockquote>&ldquo;${t.quote}&rdquo;</blockquote>
    <figcaption class="tst__meta"><b>${t.name}</b> &middot; ${t.country} &middot; ${t.program}</figcaption>
  `;
  return el;
}

async function renderFeatured() {
  const mount = document.querySelector("[data-tst-featured]");
  if (!mount) return;
  const all = await loadTestimonials();
  const lang = currentLang();
  const list = all.filter((t) => t.lang === lang).slice(0, 3);
  mount.innerHTML = "";
  list.forEach((t) => mount.appendChild(card(t)));
}

async function renderGrid() {
  const mount = document.querySelector("[data-tst-grid]");
  if (!mount) return;
  const [all, dict] = await Promise.all([loadTestimonials(), loadLocale()]);
  const lang = currentLang();
  const list = all.filter((t) => t.lang === lang);

  const programs = [...new Set(list.map((t) => t.program))];
  const filterRow = document.querySelector("[data-tst-filters]");
  const allLabel = get(dict, "tst.filterAll") || "All";

  function draw(filter) {
    mount.innerHTML = "";
    list
      .filter((t) => filter === "__all__" || t.program === filter)
      .forEach((t) => mount.appendChild(card(t)));
    mount.classList.add("in");
  }

  if (filterRow) {
    filterRow.innerHTML = "";
    const mk = (label, val) => {
      const b = document.createElement("button");
      b.textContent = label;
      b.dataset.val = val;
      b.addEventListener("click", () => {
        filterRow.querySelectorAll("button").forEach((x) => x.classList.remove("active"));
        b.classList.add("active");
        draw(val);
      });
      return b;
    };
    const allBtn = mk(allLabel, "__all__");
    allBtn.classList.add("active");
    filterRow.appendChild(allBtn);
    programs.forEach((p) => filterRow.appendChild(mk(p, p)));
  }
  draw("__all__");
}

document.addEventListener("locale:ready", () => {
  renderFeatured();
  renderGrid();
});
