/* Headless smoke test: opens each page, captures console errors,
   and reports basic health (preloader gone, cards rendered). */
const puppeteer = require("puppeteer-core");
const fs = require("fs");

const EDGE_PATHS = [
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
];

(async () => {
  const exe = EDGE_PATHS.find((p) => fs.existsSync(p));
  if (!exe) { console.log("NO BROWSER FOUND"); process.exit(1); }
  console.log("Using browser:", exe);

  const browser = await puppeteer.launch({ executablePath: exe, headless: "new" });

  const pages = [
    "http://localhost:5173/",
    "http://localhost:5173/inventory.html",
    "http://localhost:5173/car.html?id=ferrari-488-gtb",
    "http://localhost:5173/compare.html?ids=ferrari-488-gtb,porsche-911-carrera-s,bmw-m4-competition",
    "http://localhost:5173/404.html",
  ];

  for (const url of pages) {
    const page = await browser.newPage();
    const errors = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    page.on("pageerror", (err) => errors.push("PAGEERROR: " + err.message));

    await page.setViewport({ width: 1440, height: 900 });
    try {
      await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });
    } catch (e) {
      errors.push("NAV: " + e.message);
    }
    if (url.includes("car.html")) {
      // Trigger the lazy-loaded 3D studio
      await page.evaluate(() => {
        const s = document.getElementById("studio");
        if (s) window.scrollTo(0, s.offsetTop - 400);
      });
    }
    await new Promise((r) => setTimeout(r, url.includes("car.html") ? 12000 : 4000));

    const health = await page.evaluate(() => ({
      preloaderGone: !document.getElementById("preloader"),
      cardCount: document.querySelectorAll(".car-card").length,
      slideCount: document.querySelectorAll(".showcase__slide").length,
      heroTitle: (document.querySelector("h1") || {}).textContent?.trim().slice(0, 60),
      bodyVisible: getComputedStyle(document.body).opacity,
      mainOpacity: document.querySelector("main") ? getComputedStyle(document.querySelector("main")).opacity : "n/a",
      studio: document.getElementById("studioStage")
        ? {
            loaderDone: document.getElementById("studioLoader").classList.contains("is-done"),
            iframe: (document.querySelector(".studio__iframe") || {}).src ? "yes" : "none",
          }
        : "n/a",
      burger: !!document.getElementById("navBurger"),
      garageBadge: !!document.querySelector(".nav__garage"),
      compareCells: document.querySelectorAll(".compare-cell--value").length,
      bestCells: document.querySelectorAll(".compare-cell--best").length,
      testimonials: document.querySelectorAll(".testimonial").length,
      modal: !!document.getElementById("enquiryModal"),
      lightbox: !!document.getElementById("lightbox"),
    }));

    console.log("\n=== " + url + " ===");
    console.log("health:", JSON.stringify(health));
    console.log("errors:", errors.length ? errors.join("\n  | ") : "none");
    await page.close();
  }

  await browser.close();
})();
