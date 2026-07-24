/* ═══════════════════════════════════════════
   VELOCE — Vehicle Detail Page
   Populates content from ?id= and drives all
   detail-page animations
   ═══════════════════════════════════════════ */

const params = new URLSearchParams(window.location.search);
const car = getCar(params.get("id"));

if (!car) {
  window.location.replace("inventory.html");
  throw new Error("Unknown vehicle id");
}

document.title = `${car.brand} ${car.model} — VELOCE`;
Recent.add(car.id);

/* ─────────── HERO ─────────── */
const heroImg = document.getElementById("heroImg");
heroImg.src = IMG(car.image, 2400);
heroImg.alt = `${car.brand} ${car.model}`;

document.getElementById("crumbBrand").textContent = `${car.brand} ${car.model}`;
document.getElementById("heroBrand").textContent = car.brand;
document.getElementById("heroTagline").textContent = car.tagline;
document.getElementById("heroPrice").textContent = fmtPrice(car.price);

const heroTitle = document.getElementById("heroTitle");
heroTitle.classList.add("split-text");
heroTitle.textContent = car.model;

document.getElementById("heroMeta").innerHTML = [
  car.year,
  car.mileage,
  car.drivetrain,
  car.transmission,
  ...(car.badge ? [car.badge] : []),
].map((m) => `<span>${m}</span>`).join("");

/* ─────────── QUICK SPECS ─────────── */
const qsHp = document.getElementById("qsHp");
qsHp.dataset.count = car.hp;
document.getElementById("qsAccel").dataset.count = car.accel;
document.getElementById("qsAccel").dataset.decimals = "1";
document.getElementById("qsSpeed").dataset.count = car.topSpeed;
document.getElementById("qsTorque").dataset.count = car.torque;

/* ─────────── OVERVIEW ─────────── */
document.getElementById("carDescription").textContent = car.description;
document.getElementById("featureList").innerHTML = car.features
  .map((f) => `<li><i>✦</i>${f}</li>`)
  .join("");

/* ─────────── RATINGS ─────────── */
const RATING_LABELS = {
  performance: "Performance",
  handling: "Handling",
  comfort: "Comfort",
  exclusivity: "Exclusivity",
};
document.getElementById("ratingsList").innerHTML = Object.entries(car.ratings)
  .map(([key, val]) => `
    <div class="rating">
      <div class="rating__head">
        <span>${RATING_LABELS[key]}</span>
        <strong data-count="${val}">0</strong>
      </div>
      <div class="rating__bar"><div class="rating__fill" data-fill="${val}"></div></div>
    </div>`)
  .join("");

/* ─────────── GALLERY ─────────── */
const galleryImgs = [car.image, ...car.gallery];
document.getElementById("galleryGrid").innerHTML = galleryImgs
  .map((id, i) => `
    <figure class="gallery__item${i === 0 ? " gallery__item--wide" : ""}">
      <img src="${IMG(id, 2000)}" alt="${car.brand} ${car.model} — photo ${i + 1}" loading="lazy" />
    </figure>`)
  .join("");

/* ─────────── SPEC TABLE ─────────── */
const SPEC_ROWS = [
  ["Make", car.brand],
  ["Model", car.model],
  ["Year", car.year],
  ["Mileage", car.mileage],
  ["Engine", car.engine],
  ["Power", `${car.hp} HP`],
  ["Torque", `${car.torque} Nm`],
  ["Transmission", car.transmission],
  ["Drivetrain", car.drivetrain],
  ["0–100 km/h", `${car.accel.toFixed(1)} s`],
  ["Top Speed", `${car.topSpeed} km/h`],
  ["Exterior", car.exterior],
  ["Interior", car.interior],
  ["Price", fmtPrice(car.price)],
];
document.getElementById("specsTable").innerHTML = SPEC_ROWS
  .map(([label, value]) => `
    <div class="specs__row">
      <span class="specs__label">${label}</span>
      <span class="specs__value">${value}</span>
    </div>`)
  .join("");

/* ─────────── SIMILAR VEHICLES ─────────── */
const similar = CARS.filter((c) => c.id !== car.id)
  .sort((a, b) => {
    // Same brand first, then closest price
    const brandDiff = Number(b.brand === car.brand) - Number(a.brand === car.brand);
    if (brandDiff) return brandDiff;
    return Math.abs(a.price - car.price) - Math.abs(b.price - car.price);
  })
  .slice(0, 3);
document.getElementById("similarGrid").innerHTML = similar.map((c) => carCardHTML(c)).join("");

/* ─────────── CTA + NEXT CAR ─────────── */
document.getElementById("ctaImg").src = IMG(car.gallery[0] || car.image, 2400);

const nextCar = CARS[(CARS.indexOf(car) + 1) % CARS.length];
document.getElementById("nextCar").href = carUrl(nextCar.id);
document.getElementById("nextCarImg").src = IMG(nextCar.image, 2000);
document.getElementById("nextCarName").textContent = `${nextCar.brand} ${nextCar.model}`;

/* ─────────── FINANCING CALCULATOR ─────────── */
const APR = 0.089;
const downRange = document.getElementById("downRange");
const termRange = document.getElementById("termRange");
const monthlyEl = document.getElementById("financeMonthly");
let shownMonthly = 0;

function calcFinance() {
  const downPct = Number(downRange.value);
  const months = Number(termRange.value);
  const loan = car.price * (1 - downPct / 100);
  const r = APR / 12;
  const monthly = (loan * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);

  document.getElementById("downLabel").textContent =
    `${downPct}% · ${fmtPrice(Math.round(car.price * downPct / 100))}`;
  document.getElementById("termLabel").textContent = `${months} months`;
  document.getElementById("financeLoan").textContent = fmtPrice(Math.round(loan));
  document.getElementById("financeInterest").textContent =
    fmtPrice(Math.round(monthly * months - loan));

  // Tween the big number so it feels alive
  gsap.to({ v: shownMonthly }, {
    v: monthly,
    duration: 0.5,
    ease: "power2.out",
    onUpdate: function () {
      shownMonthly = this.targets()[0].v;
      monthlyEl.textContent = fmtPrice(Math.round(shownMonthly)) + "/mo";
    },
  });
}
downRange.addEventListener("input", calcFinance);
termRange.addEventListener("input", calcFinance);
calcFinance();

/* ─────────── STICKY BUY BAR ─────────── */
document.getElementById("buybarName").textContent = `${car.brand} ${car.model}`;
document.getElementById("buybarPrice").textContent = fmtPrice(car.price);

/* ─────────── ENQUIRY MODAL ─────────── */
const modal = document.getElementById("enquiryModal");
const modalForm = document.getElementById("enquiryForm");
const modalSuccess = document.getElementById("modalSuccess");
document.getElementById("modalCarName").textContent = `${car.brand} ${car.model} — ${fmtPrice(car.price)}`;

function openModal(e) {
  if (e) e.preventDefault();
  modal.classList.add("is-open");
  lenis.stop();
}
function closeModal() {
  modal.classList.remove("is-open");
  lenis.start();
}
document.querySelectorAll("[data-modal-open]").forEach((el) =>
  el.addEventListener("click", openModal)
);
modal.querySelectorAll("[data-modal-close]").forEach((el) =>
  el.addEventListener("click", closeModal)
);
window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") { closeModal(); closeLightbox(); }
});

modalForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = document.getElementById("enqName").value.trim();
  const phone = document.getElementById("enqPhone").value.trim();
  const date = document.getElementById("enqDate").value;
  if (!name || !phone || !date) {
    toast("Please fill in all fields");
    return;
  }
  // Demo persistence — a real site would POST this to a backend
  const enquiries = JSON.parse(localStorage.getItem("veloce_enquiries") || "[]");
  enquiries.push({ car: car.id, name, phone, date, at: Date.now() });
  localStorage.setItem("veloce_enquiries", JSON.stringify(enquiries));

  modalForm.style.display = "none";
  modalSuccess.classList.add("is-visible");
});

/* ─────────── GALLERY LIGHTBOX ─────────── */
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightboxImg");
const lightboxCount = document.getElementById("lightboxCount");
let lightboxIdx = 0;

function showLightbox(i) {
  lightboxIdx = (i + galleryImgs.length) % galleryImgs.length;
  lightboxImg.src = IMG(galleryImgs[lightboxIdx], 2400);
  lightboxCount.textContent = `${lightboxIdx + 1} / ${galleryImgs.length}`;
}
function openLightbox(i) {
  showLightbox(i);
  lightbox.classList.add("is-open");
  lenis.stop();
}
function closeLightbox() {
  if (!lightbox.classList.contains("is-open")) return;
  lightbox.classList.remove("is-open");
  lenis.start();
}
document.querySelectorAll(".gallery__item").forEach((item, i) =>
  item.addEventListener("click", () => openLightbox(i))
);
document.getElementById("lightboxClose").addEventListener("click", closeLightbox);
document.getElementById("lightboxPrev").addEventListener("click", () => showLightbox(lightboxIdx - 1));
document.getElementById("lightboxNext").addEventListener("click", () => showLightbox(lightboxIdx + 1));
lightbox.addEventListener("click", (e) => {
  if (e.target === lightbox) closeLightbox();
});

/* ═══════════ ANIMATIONS ═══════════ */
prepSplitText();
// The hero title is animated by the entrance timeline below,
// so exclude it from the generic scroll reveals.
heroTitle.dataset.revealBound = "1";
bindMagnetic();
bindCursorView();
bindTilt();
bindFavButtons();
initCounters();
initReveals(document, { skipHero: false });
initCardReveals();

/* Hero entrance */
const heroTl = gsap.timeline({ delay: 0.15 });
heroTl.from(".detail-hero__bg", { scale: 1.15, duration: 1.6, ease: "power3.out" });
heroTl.from(".detail-hero__title .word > span", {
  yPercent: 115,
  duration: 1.1,
  stagger: 0.06,
  ease: "power4.out",
}, "-=1.2");
heroTl.from(".detail-hero__meta span", {
  y: 20,
  opacity: 0,
  duration: 0.7,
  stagger: 0.07,
  ease: "power3.out",
}, "-=0.7");
heroTl.from(".detail-hero__bottom, .hero__scroll-hint", {
  y: 30,
  opacity: 0,
  duration: 0.8,
  ease: "power3.out",
}, "-=0.5");
heroTl.from("#nav", { y: -30, opacity: 0, duration: 0.8, ease: "power3.out" }, "-=0.8");

/* Hero mouse + scroll parallax */
if (!isTouch && !prefersReduced) {
  const bg = document.getElementById("detailHeroBg");
  const qx = gsap.quickTo(bg, "x", { duration: 1.2, ease: "power3.out" });
  const qy = gsap.quickTo(bg, "y", { duration: 1.2, ease: "power3.out" });
  document.querySelector(".detail-hero").addEventListener("mousemove", (e) => {
    qx((e.clientX / window.innerWidth - 0.5) * -30);
    qy((e.clientY / window.innerHeight - 0.5) * -18);
  });
}
gsap.to("#detailHeroBg", {
  yPercent: 14,
  ease: "none",
  scrollTrigger: { trigger: ".detail-hero", start: "top top", end: "bottom top", scrub: true },
});
gsap.to(".detail-hero__content", {
  opacity: 0,
  y: -60,
  ease: "none",
  scrollTrigger: { trigger: ".detail-hero", start: "40% top", end: "bottom top", scrub: true },
});

/* Rating bars fill on scroll */
document.querySelectorAll(".rating__fill").forEach((bar) => {
  gsap.fromTo(bar, { width: "0%" }, {
    width: bar.dataset.fill + "%",
    duration: 1.6,
    ease: "power3.out",
    scrollTrigger: { trigger: bar, start: "top 88%" },
  });
});

/* Gallery reveal + inner parallax */
document.querySelectorAll(".gallery__item").forEach((item) => {
  const img = item.querySelector("img");
  gsap.from(item, {
    y: 70,
    opacity: 0,
    duration: 1.1,
    ease: "power3.out",
    scrollTrigger: { trigger: item, start: "top 90%" },
  });
  gsap.fromTo(img, { yPercent: -8 }, {
    yPercent: 8,
    ease: "none",
    scrollTrigger: { trigger: item, start: "top bottom", end: "bottom top", scrub: true },
  });
});

/* Spec rows stagger in */
gsap.from(".specs__row", {
  y: 26,
  opacity: 0,
  duration: 0.7,
  stagger: 0.05,
  ease: "power3.out",
  scrollTrigger: { trigger: ".specs__table", start: "top 85%" },
});

/* CTA parallax */
gsap.fromTo("[data-parallax-bg]", { yPercent: -12 }, {
  yPercent: 12,
  ease: "none",
  scrollTrigger: { trigger: ".cta", start: "top bottom", end: "bottom top", scrub: true },
});

/* Sticky buy-bar appears once the hero has scrolled away */
ScrollTrigger.create({
  trigger: ".detail-hero",
  start: "bottom 60%",
  onEnter: () => document.getElementById("buybar").classList.add("is-visible"),
  onLeaveBack: () => document.getElementById("buybar").classList.remove("is-visible"),
});

/* Lightbox keyboard navigation */
window.addEventListener("keydown", (e) => {
  if (!lightbox.classList.contains("is-open")) return;
  if (e.key === "ArrowLeft") showLightbox(lightboxIdx - 1);
  if (e.key === "ArrowRight") showLightbox(lightboxIdx + 1);
});

/* Next-car hover zoom is CSS; add scroll reveal */
gsap.from(".next-car__content", {
  y: 50,
  opacity: 0,
  duration: 1,
  ease: "power3.out",
  scrollTrigger: { trigger: ".next-car", start: "top 80%" },
});
