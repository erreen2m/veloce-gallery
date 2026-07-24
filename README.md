# VELOCE — Premium Auto Gallery

A multi-page, animation-heavy premium car dealership website built as a portfolio project.

## Pages

| Page | Description |
| --- | --- |
| `index.html` | Home — hero with mouse parallax, brand marquee, featured cars, recently viewed, pinned horizontal showcase, animated stats, services, testimonials, FAQ accordion |
| `inventory.html` | Full inventory (17 cars) — brand filter pills, price range filter, live search, garage (favorites) view, sorting, compare selection with floating bar |
| `car.html?id=...` | Vehicle detail — cinematic hero, animated spec counters, performance DNA bars, interactive 3D studio, gallery with lightbox (keyboard navigable), full spec sheet, financing calculator, sticky buy bar, similar vehicles, enquiry modal, "next in collection" |
| `compare.html?ids=...` | Head-to-head comparison of up to 3 cars with per-row "best value" highlights |
| `404.html` | Styled not-found page |

All vehicle content is driven by a single data layer (`js/data.js`) — cards, showcase slides and detail pages are rendered from it, so adding a car means adding one object.

## Features

- **Smooth scroll** — Lenis-powered inertial scrolling on every page
- **Hero mouse parallax** — background, title layers and glow move at different depths
- **Pinned horizontal showcase** — the page locks and cars scroll sideways with a progress bar
- **Interactive cards** — 3D tilt, hover zoom, custom "VIEW" cursor; every card links to its detail page
- **Detail page** — count-up spec counters, scroll-filled rating bars, parallax gallery, staggered spec table
- **3D Studio** — every detail page embeds that exact car's interactive 360° model (Sketchfab community models): drag to rotate, scroll to zoom, slow auto-spin. Lazily loaded only when the section scrolls into view
- **Preloader** (home) — percentage counter with shimmering logo; skipped automatically on internal navigation
- **Page transitions** — full-screen wipe with the VELOCE wordmark between pages
- **My Garage** — heart any car to save it (localStorage); badge in the nav, dedicated filter view in the inventory
- **Compare** — pick up to 3 cars with the VS button, floating compare bar, side-by-side sheet with best-value highlights
- **Mobile menu** — full-screen overlay with staggered links and a garage counter
- **Enquiry modal** — test-drive booking form with success animation (stored locally, demo only)
- **Toasts & scroll progress bar** — site-wide feedback layer
- **Financing calculator** — down-payment and term sliders with a live, GSAP-tweened monthly payment estimate on every car page
- **Sticky buy bar** — car name, price and an Enquire shortcut slide in once the detail hero scrolls away
- **Recently viewed** — the home page greets returning visitors with the cars they last opened (localStorage)
- **Newsletter + back-to-top** — injected site-wide from `common.js`
- **Magnetic buttons** and scroll-speed-reactive brand marquee

## Tech

- HTML / CSS / Vanilla JS — no build step
- [GSAP 3](https://gsap.com) + ScrollTrigger — animations
- [Lenis](https://lenis.darkroom.engineering) — smooth scroll
- [Sketchfab](https://sketchfab.com) embeds — per-car interactive 3D models (model UIDs live in `js/data.js`; attribution shown inside the viewer)
- Google Fonts — Syne (display) + Inter (body)
- Images: Unsplash (requires internet on first load)

## Run

```bash
cd veloce-gallery
npx http-server -p 5173 -c-1 .
# → http://localhost:5173
```

Note: avoid `npx serve` — its clean-URL redirects strip the `?id=` query string from `car.html` links. `http-server` or `python -m http.server` both work fine.
