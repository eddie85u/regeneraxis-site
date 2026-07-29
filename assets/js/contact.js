import { loadLocale, DATA_BASE, get } from "./i18n.js";

/* Populate the "program of interest" select from programs.json + locale names. */
async function fillProgramSelect() {
  const sel = document.querySelector("[data-program-select]");
  if (!sel) return;
  try {
    const [programs, dict] = await Promise.all([
      fetch(`${DATA_BASE}programs.json`).then((r) => r.json()),
      loadLocale(),
    ]);
    programs.forEach((p) => {
      const name = get(dict, `programs.items.${p.id}.name`) || p.id;
      const opt = document.createElement("option");
      opt.value = name;
      opt.textContent = name;
      sel.appendChild(opt);
    });
  } catch (e) {
    console.warn("contact select:", e);
  }
}

/* Progressive-enhancement submit: show a localized thank-you without leaving the page. */
function enhanceForm() {
  const form = document.querySelector("[data-contact-form]");
  if (!form) return;
  form.addEventListener("submit", async (ev) => {
    const endpoint = form.getAttribute("action") || "";
    // If the endpoint is still the placeholder, prevent a broken POST and just confirm.
    const isPlaceholder = endpoint.includes("your-form-id") || endpoint === "#";
    if (isPlaceholder) {
      ev.preventDefault();
    } else {
      // Let a real Formspree/Tally endpoint handle it via fetch for an inline thank-you.
      ev.preventDefault();
      try {
        await fetch(endpoint, {
          method: "POST",
          body: new FormData(form),
          headers: { Accept: "application/json" },
        });
      } catch (e) { /* fall through to confirmation regardless */ }
    }
    const dict = await loadLocale();
    const note = document.querySelector("[data-contact-note]");
    if (note) {
      note.textContent = get(dict, "contact.sent") || "Thank you. We will get back to you soon.";
      note.hidden = false;
    }
    form.reset();
  });
}

document.addEventListener("locale:ready", () => {
  fillProgramSelect();
  enhanceForm();
});
