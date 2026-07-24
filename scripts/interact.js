/* Interaction test: favorites, compare bar, mobile menu. */
const puppeteer = require("puppeteer-core");
const fs = require("fs");

const EDGE_PATHS = [
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
];

(async () => {
  const exe = EDGE_PATHS.find((p) => fs.existsSync(p));
  const browser = await puppeteer.launch({ executablePath: exe, headless: "new" });

  // ── Desktop: favorites + compare on inventory ──
  const page = await browser.newPage();
  const errors = [];
  page.on("pageerror", (err) => errors.push(err.message));
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto("http://localhost:5173/inventory.html", { waitUntil: "networkidle2" });
  await new Promise((r) => setTimeout(r, 2500));

  await page.evaluate(() => {
    document.querySelectorAll("[data-fav]")[0].click();
    document.querySelectorAll("[data-compare]")[0].click();
    document.querySelectorAll("[data-compare]")[1].click();
  });
  await new Promise((r) => setTimeout(r, 800));

  const state = await page.evaluate(() => ({
    garageCount: document.querySelector("[data-garage-count]").textContent,
    favActive: document.querySelectorAll(".car-card__fav.is-active").length,
    toastVisible: document.getElementById("toast")?.classList.contains("is-visible"),
    compareBarVisible: document.getElementById("compareBar").classList.contains("is-visible"),
    compareLabel: document.getElementById("compareLabel").textContent,
    compareHref: document.getElementById("compareGo").getAttribute("href"),
  }));
  console.log("inventory interactions:", JSON.stringify(state));

  // Garage filter shows only the saved car
  await page.evaluate(() => {
    document.querySelector('[data-brand="__garage"]').click();
  });
  await new Promise((r) => setTimeout(r, 1200));
  const garageView = await page.evaluate(() => ({
    cards: document.querySelectorAll(".car-card").length,
    count: document.getElementById("carCount").textContent,
  }));
  console.log("garage filter:", JSON.stringify(garageView));
  await page.close();

  // ── Mobile: burger menu ──
  const mob = await browser.newPage();
  mob.on("pageerror", (err) => errors.push("MOBILE: " + err.message));
  await mob.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await mob.goto("http://localhost:5173/inventory.html", { waitUntil: "networkidle2" });
  await new Promise((r) => setTimeout(r, 2000));
  const burgerVisible = await mob.evaluate(
    () => getComputedStyle(document.getElementById("navBurger")).display !== "none"
  );
  await mob.evaluate(() => document.getElementById("navBurger").click());
  await new Promise((r) => setTimeout(r, 900));
  const menuOpen = await mob.evaluate(() =>
    document.getElementById("menuOverlay").classList.contains("is-open")
  );
  console.log("mobile:", JSON.stringify({ burgerVisible, menuOpen }));
  await mob.screenshot({ path: "scripts/mobile-menu.png" });
  await mob.close();

  // ── Compare page screenshot ──
  const cmp = await browser.newPage();
  await cmp.setViewport({ width: 1440, height: 1400 });
  await cmp.goto(
    "http://localhost:5173/compare.html?ids=ferrari-488-gtb,porsche-911-carrera-s,bmw-m4-competition",
    { waitUntil: "networkidle2" }
  );
  await new Promise((r) => setTimeout(r, 3000));
  await cmp.evaluate(() => window.scrollTo(0, 500));
  await new Promise((r) => setTimeout(r, 1500));
  await cmp.screenshot({ path: "scripts/compare.png" });
  await cmp.close();

  console.log("pageerrors:", errors.length ? errors.join(" | ") : "none");
  await browser.close();
})();
