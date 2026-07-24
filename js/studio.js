/* ═══════════════════════════════════════════
   VELOCE — 3D Studio
   Embeds each vehicle's own interactive 360°
   model (Sketchfab community models), lazily
   loaded when the section scrolls into view.
   ═══════════════════════════════════════════ */

(function () {
  const stage = document.getElementById("studioStage");
  const loaderEl = document.getElementById("studioLoader");
  const loaderText = document.getElementById("studioLoaderText");

  const carData = getCar(new URLSearchParams(window.location.search).get("id"));
  if (!stage || !carData) return;

  if (!carData.sketchfab) {
    loaderText.textContent = "3D model coming soon for this vehicle.";
    return;
  }

  const EMBED_PARAMS = [
    "autostart=1",
    "autospin=0.2",
    "preload=1",
    "transparent=1",
    "ui_theme=dark",
    "ui_hint=1",
    "dnt=1",
  ].join("&");

  let embedded = false;
  function embed() {
    if (embedded) return;
    embedded = true;

    const iframe = document.createElement("iframe");
    iframe.src = `https://sketchfab.com/models/${carData.sketchfab}/embed?${EMBED_PARAMS}`;
    iframe.title = `${carData.brand} ${carData.model} — interactive 3D model`;
    iframe.allow = "autoplay; fullscreen; xr-spatial-tracking";
    iframe.allowFullscreen = true;
    iframe.className = "studio__iframe";

    iframe.addEventListener("load", () => {
      // Give the viewer a moment to boot before fading our loader
      setTimeout(() => loaderEl.classList.add("is-done"), 900);
    });

    stage.appendChild(iframe);
  }

  // Load the (heavy) 3D viewer only when the section approaches the viewport
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          embed();
          io.disconnect();
        }
      },
      { rootMargin: "600px 0px" }
    );
    io.observe(stage);
  } else {
    embed();
  }
})();
