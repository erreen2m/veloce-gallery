/* ═══════════════════════════════════════════
   VELOCE — Shared Core
   Lenis, cursor, magnetic, nav, reveals,
   garage (favorites), compare store, mobile
   menu, page transitions, toasts, progress
   ═══════════════════════════════════════════ */

gsap.registerPlugin(ScrollTrigger);

const isTouch = window.matchMedia("(hover: none)").matches;
const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ─────────── LENIS SMOOTH SCROLL ─────────── */
const lenis = new Lenis({
  duration: 1.15,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true,
});
lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);

/* ─────────── NAV STATE ─────────── */
const nav = document.getElementById("nav");
if (nav) {
  ScrollTrigger.create({
    start: 60,
    onUpdate: (self) => nav.classList.toggle("is-scrolled", self.scroll() > 60),
    onToggle: (self) => nav.classList.toggle("is-scrolled", self.isActive),
  });
}

/* ─────────── SCROLL PROGRESS BAR ─────────── */
const progressBarEl = document.createElement("div");
progressBarEl.id = "scrollProgress";
document.body.appendChild(progressBarEl);
lenis.on("scroll", (e) => {
  progressBarEl.style.transform = `scaleX(${e.progress || 0})`;
});

/* ─────────── SMOOTH ANCHORS (same-page only) ─────────── */
function bindAnchors(scope = document) {
  scope.querySelectorAll('a[href^="#"]').forEach((a) => {
    if (a.dataset.anchorBound || a.hasAttribute("data-modal-open")) return;
    a.dataset.anchorBound = "1";
    a.addEventListener("click", (e) => {
      const target = document.querySelector(a.getAttribute("href"));
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target, { duration: 1.4 });
    });
  });
}

/* ─────────── CUSTOM CURSOR ─────────── */
let cursorFollower = null;
function initCursor() {
  if (isTouch) return;
  const cursor = document.getElementById("cursor");
  cursorFollower = document.getElementById("cursorFollower");
  if (!cursor || !cursorFollower) return;

  const qcx = gsap.quickTo(cursor, "x", { duration: 0.08, ease: "power2.out" });
  const qcy = gsap.quickTo(cursor, "y", { duration: 0.08, ease: "power2.out" });
  const qfx = gsap.quickTo(cursorFollower, "x", { duration: 0.45, ease: "power3.out" });
  const qfy = gsap.quickTo(cursorFollower, "y", { duration: 0.45, ease: "power3.out" });

  window.addEventListener("mousemove", (e) => {
    qcx(e.clientX); qcy(e.clientY);
    qfx(e.clientX); qfy(e.clientY);
  });
}

function bindCursorView(scope = document) {
  if (isTouch || !cursorFollower) return;
  scope.querySelectorAll("[data-cursor-view]").forEach((el) => {
    if (el.dataset.cursorBound) return;
    el.dataset.cursorBound = "1";
    el.addEventListener("mouseenter", () => cursorFollower.classList.add("is-view"));
    el.addEventListener("mouseleave", () => cursorFollower.classList.remove("is-view"));
  });
}

/* ─────────── MAGNETIC ELEMENTS ─────────── */
function bindMagnetic(scope = document) {
  if (isTouch || prefersReduced) return;
  scope.querySelectorAll("[data-magnetic]").forEach((el) => {
    if (el.dataset.magneticBound) return;
    el.dataset.magneticBound = "1";
    const qx = gsap.quickTo(el, "x", { duration: 0.5, ease: "power3.out" });
    const qy = gsap.quickTo(el, "y", { duration: 0.5, ease: "power3.out" });
    el.addEventListener("mousemove", (e) => {
      const r = el.getBoundingClientRect();
      qx((e.clientX - r.left - r.width / 2) * 0.35);
      qy((e.clientY - r.top - r.height / 2) * 0.35);
    });
    el.addEventListener("mouseleave", () => { qx(0); qy(0); });
  });
}

/* ─────────── 3D TILT CARDS ─────────── */
function bindTilt(scope = document) {
  if (isTouch || prefersReduced) return;
  scope.querySelectorAll("[data-tilt]").forEach((card) => {
    if (card.dataset.tiltBound) return;
    card.dataset.tiltBound = "1";
    const qRx = gsap.quickTo(card, "rotationX", { duration: 0.6, ease: "power3.out" });
    const qRy = gsap.quickTo(card, "rotationY", { duration: 0.6, ease: "power3.out" });
    gsap.set(card, { transformPerspective: 900 });
    card.addEventListener("mousemove", (e) => {
      const r = card.getBoundingClientRect();
      qRx(((e.clientY - r.top) / r.height - 0.5) * -7);
      qRy(((e.clientX - r.left) / r.width - 0.5) * 9);
    });
    card.addEventListener("mouseleave", () => { qRx(0); qRy(0); });
  });
}

/* ─────────── TEXT HELPERS ─────────── */
function prepSplitText(scope = document) {
  scope.querySelectorAll(".split-text").forEach((el) => {
    if (el.dataset.split) return;
    el.dataset.split = "1";
    const chunks = el.innerHTML.split(/(<br\s*\/?>)/g);
    el.innerHTML = chunks
      .map((chunk) => {
        if (/^<br/.test(chunk)) return chunk;
        return chunk
          .split(" ")
          .filter(Boolean)
          .map((w) => `<span class="word"><span>${w}</span></span>`)
          .join(" ");
      })
      .join("");
  });
}

function initReveals(scope = document, { skipHero = true } = {}) {
  scope.querySelectorAll(".reveal-line").forEach((line) => {
    if (line.dataset.revealBound) return;
    const inner = line.querySelector("span");
    if (!inner || (skipHero && line.closest(".hero"))) return;
    line.dataset.revealBound = "1";
    gsap.from(inner, {
      yPercent: 120,
      duration: 1.1,
      ease: "power4.out",
      scrollTrigger: { trigger: line, start: "top 88%" },
    });
  });

  scope.querySelectorAll(".split-text").forEach((el) => {
    if (el.dataset.revealBound) return;
    el.dataset.revealBound = "1";
    gsap.from(el.querySelectorAll(".word > span"), {
      yPercent: 115,
      duration: 0.9,
      stagger: 0.045,
      ease: "power4.out",
      scrollTrigger: { trigger: el, start: "top 85%" },
    });
  });
}

/* ─────────── ANIMATED COUNTERS ─────────── */
function initCounters(scope = document) {
  scope.querySelectorAll("[data-count]").forEach((el) => {
    if (el.dataset.countBound) return;
    el.dataset.countBound = "1";
    const target = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || "";
    const decimals = parseInt(el.dataset.decimals || "0", 10);
    const obj = { val: 0 };
    gsap.to(obj, {
      val: target,
      duration: 2.2,
      ease: "power3.out",
      scrollTrigger: { trigger: el, start: "top 90%" },
      onUpdate: () => {
        const v = decimals
          ? obj.val.toFixed(decimals)
          : Math.round(obj.val).toLocaleString("en-US");
        el.textContent = v + suffix;
      },
    });
  });
}

/* ─────────── CARD REVEAL ─────────── */
function initCardReveals(scope = document) {
  gsap.utils.toArray(scope.querySelectorAll(".car-card")).forEach((card, i) => {
    if (card.dataset.revealBound) return;
    card.dataset.revealBound = "1";
    gsap.from(card, {
      y: 80,
      opacity: 0,
      duration: 1.1,
      delay: (i % 3) * 0.12,
      ease: "power3.out",
      scrollTrigger: { trigger: card, start: "top 92%" },
    });
  });
}

/* ═══════════ GARAGE (FAVORITES) ═══════════ */
const Garage = {
  key: "veloce_garage",
  list() {
    try { return JSON.parse(localStorage.getItem(this.key)) || []; }
    catch { return []; }
  },
  has(id) { return this.list().includes(id); },
  toggle(id) {
    const l = this.list();
    const i = l.indexOf(id);
    const added = i < 0;
    added ? l.push(id) : l.splice(i, 1);
    localStorage.setItem(this.key, JSON.stringify(l));
    updateGarageBadges();
    return added;
  },
  count() { return this.list().length; },
};

function updateGarageBadges() {
  document.querySelectorAll("[data-garage-count]").forEach((el) => {
    el.textContent = Garage.count();
  });
}

function bindFavButtons(scope = document) {
  scope.querySelectorAll("[data-fav]").forEach((btn) => {
    if (btn.dataset.favBound) return;
    btn.dataset.favBound = "1";
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const added = Garage.toggle(btn.dataset.fav);
      btn.classList.toggle("is-active", added);
      gsap.fromTo(btn, { scale: 0.7 }, { scale: 1, duration: 0.5, ease: "back.out(3)" });
      toast(added ? "Added to your garage ♥" : "Removed from your garage");
      document.dispatchEvent(new CustomEvent("garage:change"));
    });
  });
}

/* ═══════════ COMPARE STORE ═══════════ */
const Compare = {
  key: "veloce_compare",
  max: 3,
  list() {
    try { return JSON.parse(sessionStorage.getItem(this.key)) || []; }
    catch { return []; }
  },
  has(id) { return this.list().includes(id); },
  toggle(id) {
    const l = this.list();
    const i = l.indexOf(id);
    if (i >= 0) { l.splice(i, 1); }
    else {
      if (l.length >= this.max) return "full";
      l.push(id);
    }
    sessionStorage.setItem(this.key, JSON.stringify(l));
    return i < 0;
  },
  clear() { sessionStorage.removeItem(this.key); },
};

/* ═══════════ RECENTLY VIEWED ═══════════ */
const Recent = {
  key: "veloce_recent",
  list() {
    try { return JSON.parse(localStorage.getItem(this.key)) || []; }
    catch { return []; }
  },
  add(id) {
    const l = this.list().filter((x) => x !== id);
    l.unshift(id);
    localStorage.setItem(this.key, JSON.stringify(l.slice(0, 8)));
  },
};

/* ═══════════ TOASTS ═══════════ */
let toastTimer = null;
function toast(msg) {
  let el = document.getElementById("toast");
  if (!el) {
    el = document.createElement("div");
    el.id = "toast";
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.classList.add("is-visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("is-visible"), 2400);
}

/* ═══════════ SHARED CARD MARKUP ═══════════ */
function carCardHTML(car, opts = {}) {
  return `
    <a class="car-card" href="${carUrl(car.id)}" data-tilt data-cursor-view data-brand="${car.brand}">
      <div class="car-card__media">
        <img src="${IMG(car.image)}" alt="${car.brand} ${car.model}" loading="lazy" />
        ${car.badge ? `<span class="car-card__badge">${car.badge}</span>` : ""}
        <div class="car-card__tools">
          <button class="car-card__tool car-card__fav${Garage.has(car.id) ? " is-active" : ""}"
                  data-fav="${car.id}" aria-label="Save to garage">♥</button>
          ${opts.compare ? `
          <button class="car-card__tool car-card__vs${Compare.has(car.id) ? " is-active" : ""}"
                  data-compare="${car.id}" aria-label="Add to comparison">VS</button>` : ""}
        </div>
      </div>
      <div class="car-card__body">
        <div class="car-card__top">
          <h3>${car.brand} ${car.model}</h3>
          <span class="car-card__price">${fmtPrice(car.price)}</span>
        </div>
        <div class="car-card__specs">
          <span>${car.hp} HP</span><span>0–100: ${car.accel.toFixed(1)}s</span><span>${car.engine}</span>
        </div>
      </div>
    </a>`;
}

/* ═══════════ NAV EXTRAS (garage badge + burger) ═══════════ */
function injectNavExtras() {
  if (!nav) return;

  const garageLink = document.createElement("a");
  garageLink.className = "nav__garage";
  garageLink.href = "inventory.html?filter=garage";
  garageLink.setAttribute("aria-label", "My garage");
  garageLink.innerHTML = `♥<i data-garage-count>0</i>`;
  const cta = nav.querySelector(".nav__cta");
  nav.insertBefore(garageLink, cta);

  const burger = document.createElement("button");
  burger.className = "nav__burger";
  burger.id = "navBurger";
  burger.setAttribute("aria-label", "Open menu");
  burger.innerHTML = "<span></span><span></span>";
  nav.appendChild(burger);

  const overlay = document.createElement("div");
  overlay.className = "menu-overlay";
  overlay.id = "menuOverlay";
  overlay.innerHTML = `
    <nav class="menu-overlay__links">
      <a href="index.html"><em>01</em>Home</a>
      <a href="inventory.html"><em>02</em>Inventory</a>
      <a href="compare.html"><em>03</em>Compare</a>
      <a href="inventory.html?filter=garage"><em>04</em>My Garage <i data-garage-count>0</i></a>
      <a href="#contact"><em>05</em>Contact</a>
    </nav>
    <div class="menu-overlay__footer">
      <span>+90 212 000 00 00</span>
      <span>Maslak, Istanbul</span>
    </div>`;
  document.body.appendChild(overlay);

  let menuOpen = false;
  function toggleMenu(force) {
    menuOpen = force !== undefined ? force : !menuOpen;
    burger.classList.toggle("is-open", menuOpen);
    overlay.classList.toggle("is-open", menuOpen);
    if (menuOpen) {
      lenis.stop();
      gsap.fromTo(
        overlay.querySelectorAll(".menu-overlay__links a, .menu-overlay__footer span"),
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, stagger: 0.07, delay: 0.15, ease: "power3.out" }
      );
    } else {
      lenis.start();
    }
  }
  burger.addEventListener("click", () => toggleMenu());
  overlay.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => toggleMenu(false))
  );
}

/* ═══════════ PAGE TRANSITIONS ═══════════ */
const pageTransition = document.createElement("div");
pageTransition.className = "page-transition";
pageTransition.setAttribute("aria-hidden", "true");
pageTransition.innerHTML = `<span class="page-transition__logo">VELOCE<i>.</i></span>`;
document.body.appendChild(pageTransition);

const cameInternal = sessionStorage.getItem("veloce_nav") === "1";
sessionStorage.removeItem("veloce_nav");

function hidePageTransition(immediate = false) {
  gsap.killTweensOf(pageTransition);
  if (immediate) {
    gsap.set(pageTransition, { yPercent: 101 });
  } else {
    gsap.to(pageTransition, {
      yPercent: -101,
      duration: 0.75,
      ease: "power4.inOut",
    });
  }
  // Always park it off-screen + non-interactive after the wipe
  const settle = () => {
    gsap.set(pageTransition, { yPercent: 101 });
    pageTransition.classList.remove("is-covering");
    pageTransition.style.pointerEvents = "none";
  };
  if (immediate) settle();
  else gsap.delayedCall(0.85, settle);
}

function showPageTransition() {
  pageTransition.style.pointerEvents = "auto";
  pageTransition.classList.add("is-covering");
  gsap.killTweensOf(pageTransition);
  gsap.fromTo(pageTransition, { yPercent: 101 }, {
    yPercent: 0,
    duration: 0.5,
    ease: "power4.in",
  });
}

if (cameInternal) {
  pageTransition.style.pointerEvents = "auto";
  pageTransition.classList.add("is-covering");
  gsap.set(pageTransition, { yPercent: 0 });
  hidePageTransition(false);
  // Safety: never leave the wipe covering the site
  setTimeout(() => hidePageTransition(true), 1600);
} else {
  hidePageTransition(true);
}

window.addEventListener("pageshow", () => hidePageTransition(true));

document.addEventListener("click", (e) => {
  const a = e.target.closest("a[href]");
  if (!a) return;
  if (
    e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey ||
    a.target === "_blank" ||
    e.target.closest("[data-fav],[data-compare]")
  ) return;
  const href = a.getAttribute("href");
  if (!href || href.startsWith("#") || href.startsWith("mailto:") ||
      href.startsWith("tel:") || href.startsWith("http")) return;

  // Resolve against current location so GitHub Pages subpaths work
  let dest;
  try { dest = new URL(href, window.location.href); }
  catch { return; }
  if (dest.origin !== window.location.origin) return;

  // Same page (path + query) — don't cover with a wipe that never reloads
  if (
    dest.pathname === window.location.pathname &&
    dest.search === window.location.search
  ) {
    return;
  }

  e.preventDefault();
  sessionStorage.setItem("veloce_nav", "1");
  showPageTransition();
  gsap.delayedCall(0.52, () => {
    window.location.assign(dest.href);
  });
  // If navigation is cancelled / same-document, uncover after a beat
  setTimeout(() => hidePageTransition(true), 2500);
});

/* ─────────── PAGE ENTER (non-home pages) ─────────── */
function pageEnter() {
  gsap.from("main", { opacity: 0, duration: 0.7, ease: "power2.out" });
  gsap.from("#nav", { y: -30, opacity: 0, duration: 0.8, ease: "power3.out" });
}

/* ═══════════ BACK TO TOP ═══════════ */
function injectBackToTop() {
  const btn = document.createElement("button");
  btn.id = "backToTop";
  btn.setAttribute("aria-label", "Back to top");
  btn.textContent = "↑";
  document.body.appendChild(btn);
  btn.addEventListener("click", () => lenis.scrollTo(0, { duration: 1.6 }));
  lenis.on("scroll", (e) => btn.classList.toggle("is-visible", e.scroll > 700));
}

/* ═══════════ NEWSLETTER (footer) ═══════════ */
function injectNewsletter() {
  const footer = document.querySelector(".footer");
  if (!footer) return;
  const bottom = footer.querySelector(".footer__bottom");
  const nl = document.createElement("div");
  nl.className = "newsletter";
  nl.innerHTML = `
    <div class="newsletter__text">
      <h4>Stay in the Loop</h4>
      <p>New arrivals, private events and market insight. One email a month, no noise.</p>
    </div>
    <form class="newsletter__form" novalidate>
      <input type="email" placeholder="you@email.com" required aria-label="Email address" />
      <button type="submit" class="btn btn--solid" data-magnetic>Subscribe</button>
    </form>`;
  footer.insertBefore(nl, bottom);

  nl.querySelector("form").addEventListener("submit", (e) => {
    e.preventDefault();
    const input = nl.querySelector("input");
    if (!input.value.includes("@")) {
      toast("Please enter a valid email address");
      return;
    }
    localStorage.setItem("veloce_newsletter", input.value);
    input.value = "";
    toast("Welcome aboard — you're subscribed ✓");
  });
}

/* ─────────── BOOT SHARED PIECES ─────────── */
initCursor();
injectNavExtras();
injectBackToTop();
injectNewsletter();
updateGarageBadges();
bindAnchors();
window.addEventListener("resize", () => ScrollTrigger.refresh());
