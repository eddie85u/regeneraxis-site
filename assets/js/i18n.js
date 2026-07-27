import { currentLang, refreshReveal } from "./main.js";

/* Resolve "a.b.c" against a nested object. */
export function get(obj, path) {
  return path.split(".").reduce((o, k) => (o == null ? o : o[k]), obj);
}

/* Path to /data from any /en/ or /es/ page. */
export const DATA_BASE = "../data/";

let localeCache = null;

export async function loadLocale() {
  if (localeCache) return localeCache;
  const lang = currentLang();
  const res = await fetch(`${DATA_BASE}${lang}.json`);
  if (!res.ok) throw new Error("locale load failed");
  localeCache = await res.json();
  return localeCache;
}

/* Replace text of every [data-i18n] element. */
export function applyLocale(dict) {
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const val = get(dict, el.getAttribute("data-i18n"));
    if (typeof val === "string") {
      if (el.hasAttribute("data-i18n-html")) el.innerHTML = val;
      else el.textContent = val;
    }
  });
  document.querySelectorAll("[data-i18n-attr]").forEach((el) => {
    el.getAttribute("data-i18n-attr").split(",").forEach((pair) => {
      const [attr, key] = pair.split(":").map((s) => s.trim());
      const val = get(dict, key);
      if (typeof val === "string") el.setAttribute(attr, val);
    });
  });
}

export async function initI18n() {
  try {
    const dict = await loadLocale();
    applyLocale(dict);
    document.dispatchEvent(new CustomEvent("locale:ready", { detail: dict }));
    refreshReveal();
    return dict;
  } catch (e) {
    console.warn("i18n:", e);
    return null;
  }
}

document.addEventListener("DOMContentLoaded", initI18n);
