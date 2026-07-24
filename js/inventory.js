/* ═══════════════════════════════════════════
   VELOCE — Inventory Page
   Brand filters, live search, garage view,
   sorting, and compare selection
   ═══════════════════════════════════════════ */

const grid = document.getElementById("inventoryGrid");
const emptyMsg = document.getElementById("inventoryEmpty");
const pillsWrap = document.getElementById("brandPills");
const sortSelect = document.getElementById("sortSelect");
const priceSelect = document.getElementById("priceSelect");
const searchInput = document.getElementById("searchInput");
const carCount = document.getElementById("carCount");

const compareBar = document.getElementById("compareBar");
const compareItems = document.getElementById("compareItems");
const compareLabel = document.getElementById("compareLabel");
const compareGo = document.getElementById("compareGo");
const compareClear = document.getElementById("compareClear");

const GARAGE_PILL = "__garage";
let activeBrand = "All";
let searchTerm = "";

/* ─────────── BRAND PILLS ─────────── */
const brands = ["All", ...new Set(CARS.map((c) => c.brand))];
pillsWrap.innerHTML =
  brands
    .map((b) => `<button class="filter-pill${b === "All" ? " is-active" : ""}" data-brand="${b}">${b}</button>`)
    .join("") +
  `<button class="filter-pill" data-brand="${GARAGE_PILL}">♥ Garage</button>`;

// Deep link: inventory.html?filter=garage
if (new URLSearchParams(window.location.search).get("filter") === "garage") {
  activeBrand = GARAGE_PILL;
  pillsWrap.querySelectorAll(".filter-pill").forEach((p) =>
    p.classList.toggle("is-active", p.dataset.brand === GARAGE_PILL)
  );
}

pillsWrap.addEventListener("click", (e) => {
  const pill = e.target.closest(".filter-pill");
  if (!pill) return;
  activeBrand = pill.dataset.brand;
  pillsWrap.querySelectorAll(".filter-pill").forEach((p) =>
    p.classList.toggle("is-active", p === pill)
  );
  render();
});

sortSelect.addEventListener("change", render);
priceSelect.addEventListener("change", render);
searchInput.addEventListener("input", () => {
  searchTerm = searchInput.value.trim().toLowerCase();
  render();
});

// Re-render garage view live when a heart is toggled
document.addEventListener("garage:change", () => {
  if (activeBrand === GARAGE_PILL) render();
});

/* ─────────── SORTING ─────────── */
const sorters = {
  featured: (a, b) => Number(b.featured) - Number(a.featured),
  "price-desc": (a, b) => b.price - a.price,
  "price-asc": (a, b) => a.price - b.price,
  "hp-desc": (a, b) => b.hp - a.hp,
  "accel-asc": (a, b) => a.accel - b.accel,
};

/* ─────────── RENDER ─────────── */
function render() {
  const garageIds = Garage.list();
  const list = CARS
    .filter((c) => {
      if (activeBrand === GARAGE_PILL) return garageIds.includes(c.id);
      return activeBrand === "All" || c.brand === activeBrand;
    })
    .filter((c) =>
      !searchTerm || `${c.brand} ${c.model}`.toLowerCase().includes(searchTerm)
    )
    .filter((c) => {
      if (priceSelect.value === "all") return true;
      const [min, max] = priceSelect.value.split("-").map(Number);
      return c.price >= min && c.price <= max;
    })
    .sort(sorters[sortSelect.value]);

  carCount.textContent = list.length;
  emptyMsg.hidden = list.length > 0;
  emptyMsg.textContent =
    activeBrand === GARAGE_PILL && !garageIds.length
      ? "Your garage is empty — tap ♥ on any car to save it here."
      : "No vehicles match this filter.";

  grid.innerHTML = list.map((c) => carCardHTML(c, { compare: true })).join("");

  bindCursorView(grid);
  bindFavButtons(grid);
  bindCompareButtons();

  gsap.from(grid.querySelectorAll(".car-card"), {
    y: 60,
    opacity: 0,
    duration: 0.9,
    stagger: 0.07,
    ease: "power3.out",
    onComplete: () => bindTilt(grid),
  });
}

/* ─────────── COMPARE SELECTION ─────────── */
function bindCompareButtons() {
  grid.querySelectorAll("[data-compare]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const result = Compare.toggle(btn.dataset.compare);
      if (result === "full") {
        toast(`You can compare up to ${Compare.max} cars`);
        return;
      }
      btn.classList.toggle("is-active", result === true);
      updateCompareBar();
    });
  });
}

function updateCompareBar() {
  const ids = Compare.list();
  compareBar.classList.toggle("is-visible", ids.length > 0);

  compareItems.innerHTML = ids
    .map((id) => {
      const c = getCar(id);
      return `
        <div class="compare-bar__item">
          <img src="${IMG(c.image, 400)}" alt="${c.model}" />
          <button data-remove="${id}" aria-label="Remove ${c.model}">×</button>
        </div>`;
    })
    .join("");

  compareLabel.textContent = `${ids.length}/${Compare.max} selected`;
  compareGo.href = `compare.html?ids=${ids.join(",")}`;
  compareGo.style.opacity = ids.length >= 2 ? "" : "0.45";
  compareGo.style.pointerEvents = ids.length >= 2 ? "" : "none";

  compareItems.querySelectorAll("[data-remove]").forEach((btn) => {
    btn.addEventListener("click", () => {
      Compare.toggle(btn.dataset.remove);
      grid.querySelectorAll(`[data-compare="${btn.dataset.remove}"]`).forEach((b) =>
        b.classList.remove("is-active")
      );
      updateCompareBar();
    });
  });
}

compareClear.addEventListener("click", () => {
  Compare.clear();
  grid.querySelectorAll("[data-compare]").forEach((b) => b.classList.remove("is-active"));
  updateCompareBar();
});

/* ─────────── BOOT ─────────── */
prepSplitText();
bindMagnetic();
render();
updateCompareBar();
initReveals(document, { skipHero: false });
pageEnter();

gsap.from(".footer__big", {
  yPercent: 45,
  opacity: 0,
  ease: "none",
  scrollTrigger: { trigger: ".footer__big", start: "top bottom", end: "top 55%", scrub: true },
});
