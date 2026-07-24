/* ═══════════════════════════════════════════
   VELOCE — Compare Page
   Side-by-side spec sheet with "best value"
   highlights per row
   ═══════════════════════════════════════════ */

const wrap = document.getElementById("compareWrap");
const empty = document.getElementById("compareEmpty");

// Cars come from ?ids=a,b,c or, as a fallback, the compare selection
const idsParam = new URLSearchParams(window.location.search).get("ids");
const ids = (idsParam ? idsParam.split(",") : Compare.list()).slice(0, Compare.max);
const cars = ids.map(getCar).filter(Boolean);

if (cars.length < 2) {
  empty.hidden = false;
} else {
  buildGrid(cars);
}

function buildGrid(cars) {
  const n = cars.length;

  // best: "min" | "max" | null, fmt: value formatter
  const ROWS = [
    { label: "Price", get: (c) => c.price, best: "min", fmt: (v) => fmtPrice(v) },
    { label: "Year", get: (c) => c.year, best: "max", fmt: (v) => v },
    { label: "Power", get: (c) => c.hp, best: "max", fmt: (v) => v + " HP" },
    { label: "Torque", get: (c) => c.torque, best: "max", fmt: (v) => v + " Nm" },
    { label: "0–100 km/h", get: (c) => c.accel, best: "min", fmt: (v) => v.toFixed(1) + " s" },
    { label: "Top Speed", get: (c) => c.topSpeed, best: "max", fmt: (v) => v + " km/h" },
    { label: "Engine", get: (c) => c.engine, best: null },
    { label: "Transmission", get: (c) => c.transmission, best: null },
    { label: "Drivetrain", get: (c) => c.drivetrain, best: null },
    { label: "Mileage", get: (c) => c.mileage, best: null },
    { label: "Performance", get: (c) => c.ratings.performance, best: "max", fmt: (v) => v + " / 100" },
    { label: "Handling", get: (c) => c.ratings.handling, best: "max", fmt: (v) => v + " / 100" },
    { label: "Comfort", get: (c) => c.ratings.comfort, best: "max", fmt: (v) => v + " / 100" },
    { label: "Exclusivity", get: (c) => c.ratings.exclusivity, best: "max", fmt: (v) => v + " / 100" },
  ];

  let html = "";

  // Image row
  html += `<div class="compare-cell--label" aria-hidden="true"></div>`;
  cars.forEach((c) => {
    html += `<div class="compare-cell--img"><img src="${IMG(c.image, 1200)}" alt="${c.brand} ${c.model}" /></div>`;
  });

  // Name row
  html += `<div class="compare-cell--label">Model</div>`;
  cars.forEach((c) => {
    html += `
      <div class="compare-cell--value compare-cell--head">
        <h3>${c.brand} ${c.model}</h3>
        <a href="${carUrl(c.id)}">View Details →</a>
      </div>`;
  });

  // Spec rows
  ROWS.forEach((row) => {
    const values = cars.map(row.get);
    let bestIdx = -1;
    if (row.best === "min") bestIdx = values.indexOf(Math.min(...values));
    if (row.best === "max") bestIdx = values.indexOf(Math.max(...values));

    html += `<div class="compare-cell--label">${row.label}</div>`;
    values.forEach((v, i) => {
      const isBest = i === bestIdx && n > 1;
      html += `<div class="compare-cell--value${isBest ? " compare-cell--best" : ""}">${row.fmt ? row.fmt(v) : v}</div>`;
    });
  });

  const grid = document.createElement("div");
  grid.className = "compare-grid";
  grid.style.gridTemplateColumns = `minmax(90px, 150px) repeat(${n}, 1fr)`;
  grid.innerHTML = html;
  wrap.appendChild(grid);

  gsap.from(grid, {
    y: 60,
    opacity: 0,
    duration: 1,
    ease: "power3.out",
    scrollTrigger: { trigger: grid, start: "top 90%" },
  });
}

/* ─────────── BOOT ─────────── */
prepSplitText();
bindMagnetic();
bindCursorView();
initReveals(document, { skipHero: false });
pageEnter();
