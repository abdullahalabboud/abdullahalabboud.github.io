const ICONS = {
  eye: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  globe: '<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20"/>',
  layers: '<path d="M12 2 2 7l10 5 10-5-10-5z"/><path d="m2 17 10 5 10-5M2 12l10 5 10-5"/>',
  pulse: '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>',
  film: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="M7 4v16M17 4v16M2 9h5M17 9h5M2 15h5M17 15h5"/>',
  chip: '<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4"/>',
  signal: '<path d="M5 12.5a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0"/><circle cx="12" cy="19.5" r="1"/>',
  cable: '<path d="M4 9V5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4M6 9v6a6 6 0 0 0 12 0V9M16 9V5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4"/>',
  phone: '<rect x="6" y="2" width="12" height="20" rx="2"/><path d="M11 18h2"/>',
  box: '<path d="M21 8 12 3 3 8v8l9 5 9-5V8z"/><path d="m3 8 9 5 9-5M12 13v8"/>'
};

const svg = name =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${ICONS[name]}</svg>`;

let currentLang = "en";
let currentFilter = "all";

function renderProjects() {
  const t = I18N[currentLang];
  document.getElementById("projectGrid").innerHTML = PROJECTS.map(p => {
    const [title, desc] = p[currentLang];
    const hidden = currentFilter !== "all" && p.cat !== currentFilter ? " hidden" : "";
    return `<article class="project reveal in${hidden}" data-cat="${p.cat}">
      <div class="project-top">
        <div class="project-icon">${svg(p.icon)}</div>
        <span class="cat">${t.cats[p.cat]}</span>
      </div>
      <h3>${title}</h3>
      <p>${desc}</p>
      <div class="tags">${p.tags.map(tag => `<span>${tag}</span>`).join("")}</div>
    </article>`;
  }).join("");
}

function renderSkills() {
  document.getElementById("skillGrid").innerHTML = SKILLS.map(g => `
    <div class="skill-card reveal in">
      <h3>${g[currentLang]}</h3>
      <ul>${g.items.map(i => i.startsWith("*") ? `<li class="lvl">${i.slice(1)}</li>` : `<li>${i}</li>`).join("")}</ul>
    </div>`).join("");
}

function setLang(lang) {
  if (!I18N[lang]) lang = "en";
  currentLang = lang;
  const t = I18N[lang];
  const html = document.documentElement;
  html.lang = lang;
  html.dir = lang === "ar" ? "rtl" : "ltr";
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const val = t[el.dataset.i18n];
    if (typeof val === "string") el.textContent = val;
  });
  document.getElementById("cvLink").href = t.cv;
  document.title = `${t["hero.name"]} — ${t["hero.role"]}`;
  document.querySelectorAll(".lang-switch button").forEach(b => b.classList.toggle("active", b.dataset.lang === lang));
  renderProjects();
  renderSkills();
  try { localStorage.setItem("lang", lang); } catch (e) { /* storage unavailable */ }
}

document.querySelectorAll(".lang-switch button").forEach(b => b.addEventListener("click", () => setLang(b.dataset.lang)));

document.querySelectorAll(".filters button").forEach(b => b.addEventListener("click", () => {
  currentFilter = b.dataset.filter;
  document.querySelectorAll(".filters button").forEach(x => x.classList.toggle("active", x === b));
  document.querySelectorAll(".project").forEach(p =>
    p.classList.toggle("hidden", currentFilter !== "all" && p.dataset.cat !== currentFilter));
}));

const navLinks = document.getElementById("navLinks");
document.getElementById("menuBtn").addEventListener("click", () => navLinks.classList.toggle("open"));
navLinks.querySelectorAll("a").forEach(a => a.addEventListener("click", () => navLinks.classList.remove("open")));

document.getElementById("year").textContent = new Date().getFullYear();

// Tech strip: the list is doubled so the -50% scroll loops seamlessly
document.getElementById("marquee").innerHTML =
  [...MARQUEE, ...MARQUEE].map(item => `<span>${item}</span>`).join("");

// Reveal static sections on scroll
document.querySelectorAll(".section-head, .statement, .about-grid, .service, .timeline > li, .edu-card, .langs, .contact-inner")
  .forEach(el => el.classList.add("reveal"));
const io = new IntersectionObserver(entries => entries.forEach(e => {
  if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
}), { threshold: 0.12 });
document.querySelectorAll(".reveal:not(.in)").forEach(el => io.observe(el));

// Initial language: ?lang= in URL, then saved choice, then browser language
let initial = new URLSearchParams(location.search).get("lang");
if (!initial) { try { initial = localStorage.getItem("lang"); } catch (e) {} }
if (!initial) {
  const nav = (navigator.language || "en").slice(0, 2);
  initial = I18N[nav] ? nav : "en";
}
setLang(initial);
