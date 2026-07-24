/* ═══════════════════════════════════════════
   VELOCE — Home Page
   Renders featured cars + showcase from data,
   then drives the hero / marquee / scroll FX
   ═══════════════════════════════════════════ */

/* ─────────── RENDER FROM DATA ─────────── */
const featuredGrid = document.getElementById("featuredGrid");
featuredGrid.innerHTML = CARS.filter((c) => c.featured).map(carCardHTML).join("");

const showcaseTrack = document.getElementById("showcaseTrack");
showcaseTrack.innerHTML = SHOWCASE_IDS.map((id, i) => {
  const car = getCar(id);
  return `
    <a class="showcase__slide" href="${carUrl(car.id)}" data-cursor-view>
      <span class="showcase__num">0${i + 1}</span>
      <div class="showcase__img">
        <img src="${IMG(car.image, 2000)}" alt="${car.brand} ${car.model}" />
      </div>
      <div class="showcase__info">
        <h3>${car.brand} ${car.model}</h3>
        <p>${car.tagline}</p>
        <span class="showcase__link">View Details →</span>
      </div>
    </a>`;
}).join("");

// Recently viewed strip (only when there's history)
const recentIds = Recent.list().filter(getCar);
if (recentIds.length) {
  document.getElementById("recentSection").hidden = false;
  document.getElementById("recentGrid").innerHTML = recentIds
    .slice(0, 3)
    .map((id) => carCardHTML(getCar(id)))
    .join("");
}

prepSplitText();
bindMagnetic();
bindTilt();
bindCursorView();
bindFavButtons();

/* ─────────── FAQ ACCORDION ─────────── */
document.querySelectorAll(".faq__item").forEach((item) => {
  const q = item.querySelector(".faq__q");
  const a = item.querySelector(".faq__a");
  gsap.set(a, { height: 0 });
  q.addEventListener("click", () => {
    const open = item.classList.toggle("is-open");
    gsap.to(a, {
      height: open ? "auto" : 0,
      duration: 0.55,
      ease: "power3.inOut",
      onComplete: () => ScrollTrigger.refresh(),
    });
  });
});

/* ─────────── PRELOADER ─────────── */
const preloader = document.getElementById("preloader");
const progressBar = document.getElementById("preloaderProgress");
const countEl = document.getElementById("preloaderCount");
let preloaderStarted = false;

function setProgress(p) {
  progressBar.style.width = p + "%";
  countEl.textContent = Math.round(p) + "%";
}

function initPreloader() {
  if (preloaderStarted) return;
  preloaderStarted = true;

  // Skip the full preloader when arriving via an internal link —
  // the page transition overlay already covers the load.
  if (cameInternal) {
    preloader.remove();
    revealSite(true);
    return;
  }

  const images = Array.from(document.querySelectorAll("img"));
  let loaded = 0;
  let displayed = 0;
  const total = images.length || 1;

  const tick = setInterval(() => {
    const target = (loaded / total) * 100;
    displayed += (target - displayed) * 0.12 + 0.3;
    if (displayed > 99.5) displayed = 100;
    setProgress(Math.min(displayed, 100));
    if (displayed >= 100) {
      clearInterval(tick);
      revealSite();
    }
  }, 30);

  const done = () => { loaded++; };
  images.forEach((img) => {
    if (img.complete) done();
    else {
      img.addEventListener("load", done);
      img.addEventListener("error", done);
    }
  });

  // Safety net: always open after 6 seconds
  setTimeout(() => { loaded = total; }, 6000);
}

function revealSite(instant = false) {
  const tl = gsap.timeline({ delay: instant ? 0.35 : 0 });
  if (!instant) {
    tl.to(preloader, {
      yPercent: -100,
      duration: 1,
      ease: "power4.inOut",
      onComplete: () => preloader.remove(),
    });
  }

  tl.from(".hero__title-line > span", {
    yPercent: 110,
    duration: 1.2,
    stagger: 0.12,
    ease: "power4.out",
  }, "-=0.45");
  tl.from(".hero__eyebrow span, .hero__sub span", {
    yPercent: 120,
    opacity: 0,
    duration: 1,
    stagger: 0.1,
    ease: "power3.out",
  }, "-=0.9");
  tl.from(".hero__actions .btn", {
    y: 24,
    opacity: 0,
    duration: 0.8,
    stagger: 0.1,
    ease: "power3.out",
  }, "-=0.7");
  tl.from(".hero__stats .hero__stat, .hero__scroll-hint", {
    y: 20,
    opacity: 0,
    duration: 0.8,
    stagger: 0.08,
    ease: "power3.out",
  }, "-=0.6");
  tl.from(".nav", {
    y: -30,
    opacity: 0,
    duration: 0.8,
    ease: "power3.out",
  }, "-=0.8");
}

window.addEventListener("load", initPreloader);
setTimeout(initPreloader, 2500);

/* ─────────── HERO MOUSE PARALLAX ─────────── */
if (!isTouch && !prefersReduced) {
  const heroBg = document.getElementById("heroBg");
  const glow = document.querySelector(".hero__glow");
  const depthEls = document.querySelectorAll("[data-parallax-depth]");

  const qBgX = gsap.quickTo(heroBg, "x", { duration: 1.2, ease: "power3.out" });
  const qBgY = gsap.quickTo(heroBg, "y", { duration: 1.2, ease: "power3.out" });
  const qGlowX = gsap.quickTo(glow, "x", { duration: 1.6, ease: "power3.out" });
  const qGlowY = gsap.quickTo(glow, "y", { duration: 1.6, ease: "power3.out" });

  const depthTweens = Array.from(depthEls).map((el) => ({
    depth: parseFloat(el.dataset.parallaxDepth),
    qx: gsap.quickTo(el, "x", { duration: 1, ease: "power3.out" }),
    qy: gsap.quickTo(el, "y", { duration: 1, ease: "power3.out" }),
  }));

  document.querySelector(".hero").addEventListener("mousemove", (e) => {
    const nx = e.clientX / window.innerWidth - 0.5;
    const ny = e.clientY / window.innerHeight - 0.5;
    qBgX(nx * -34); qBgY(ny * -22);
    qGlowX(nx * 90); qGlowY(ny * 60);
    depthTweens.forEach(({ depth, qx, qy }) => {
      qx(nx * 44 * depth);
      qy(ny * 26 * depth);
    });
  });
}

// Hero scroll parallax
gsap.to("#heroBg", {
  yPercent: 16,
  ease: "none",
  scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
});
gsap.to(".hero__content, .hero__stats, .hero__scroll-hint", {
  opacity: 0,
  y: -60,
  ease: "none",
  scrollTrigger: { trigger: ".hero", start: "35% top", end: "bottom top", scrub: true },
});

/* ─────────── MARQUEE ─────────── */
const track = document.getElementById("marqueeTrack");
track.innerHTML += track.innerHTML; // duplicate for a seamless loop

const marqueeTween = gsap.to(track, {
  xPercent: -50,
  duration: 28,
  ease: "none",
  repeat: -1,
});

let marqueeBoost = 0;
lenis.on("scroll", (e) => {
  marqueeBoost = gsap.utils.clamp(-3, 3, e.velocity * 0.06);
});
gsap.ticker.add(() => {
  marqueeTween.timeScale(
    gsap.utils.interpolate(marqueeTween.timeScale(), 1 + Math.abs(marqueeBoost), 0.08)
  );
});

/* ─────────── SCROLL REVEALS ─────────── */
initReveals();
initCounters();
initCardReveals();

/* ─────────── HORIZONTAL SHOWCASE ─────────── */
const showcaseProgress = document.getElementById("showcaseProgress");

function getScrollAmount() {
  return -(showcaseTrack.scrollWidth - window.innerWidth);
}

const showcaseTween = gsap.to(showcaseTrack, {
  x: getScrollAmount,
  ease: "none",
  scrollTrigger: {
    trigger: ".showcase",
    start: "top top",
    end: () => "+=" + Math.abs(getScrollAmount()) * 1.05,
    pin: ".showcase__pin",
    scrub: 1,
    invalidateOnRefresh: true,
    anticipatePin: 1,
    onUpdate: (self) => {
      showcaseProgress.style.width = self.progress * 100 + "%";
    },
  },
});

// Counter-directional micro parallax inside each slide
gsap.utils.toArray(".showcase__img img").forEach((img) => {
  gsap.fromTo(img, { xPercent: -6 }, {
    xPercent: 0,
    ease: "none",
    scrollTrigger: {
      trigger: img.closest(".showcase__slide"),
      containerAnimation: showcaseTween,
      start: "left right",
      end: "right left",
      scrub: true,
    },
  });
});

/* ─────────── CTA PARALLAX ─────────── */
gsap.fromTo("[data-parallax-bg]", { yPercent: -12 }, {
  yPercent: 12,
  ease: "none",
  scrollTrigger: { trigger: ".cta", start: "top bottom", end: "bottom top", scrub: true },
});

/* ─────────── FOOTER BIG TYPE ─────────── */
gsap.from(".footer__big", {
  yPercent: 45,
  opacity: 0,
  ease: "none",
  scrollTrigger: { trigger: ".footer__big", start: "top bottom", end: "top 55%", scrub: true },
});
