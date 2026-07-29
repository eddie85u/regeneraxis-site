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
  // Optional media. Priority: a lazy YouTube facade when "youtube" is set
  // (the heavy iframe is only built on click, so it never touches load
  // performance); otherwise a still "image" (root-absolute path, e.g.
  // /assets/img/testimonials/name.jpg) shown in the same slot. Images now,
  // video later is a drop-in swap.
  const media = t.youtube
    ? `<div class="tst__video" role="button" tabindex="0" aria-label="Play video">
         <img loading="lazy" src="https://i.ytimg.com/vi/${t.youtube}/hqdefault.jpg" alt="">
         <span class="tst__play" aria-hidden="true"><span></span></span>
       </div>`
    : t.image
    ? `<div class="tst__photo"><img loading="lazy" src="${t.image}" alt=""></div>`
    : "";
  const quote = t.quote
    ? `<blockquote>&ldquo;${t.quote}&rdquo;</blockquote>`
    : "";
  el.innerHTML = `${media}${quote}
    <figcaption class="tst__meta"><b>${t.name}</b> &middot; ${t.country} &middot; ${t.program}</figcaption>`;

  const v = el.querySelector(".tst__video");
  if (v) {
    const play = () => {
      v.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${t.youtube}?autoplay=1&rel=0" title="${t.name}" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>`;
    };
    v.addEventListener("click", play);
    v.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); play(); }
    });
  }
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
