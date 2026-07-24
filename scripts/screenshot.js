/* Captures a screenshot of the 3D Studio section on a car detail page. */
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
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto("http://localhost:5173/car.html?id=ferrari-488-gtb", {
    waitUntil: "networkidle2",
    timeout: 40000,
  });
  await page.evaluate(() => {
    const s = document.getElementById("studio");
    window.scrollTo(0, s.offsetTop - 200);
  });
  await page.waitForSelector("#studioLoader.is-done", { timeout: 40000 });
  // Give the Sketchfab viewer time to download and render the model
  await new Promise((r) => setTimeout(r, 12000));
  const studio = await page.$("#studio");
  await studio.screenshot({ path: "scripts/studio.png" });
  await browser.close();
  console.log("saved scripts/studio.png");
})();
