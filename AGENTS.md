# AGENTS.md

## Cursor Cloud specific instructions

This is a static site (plain HTML/CSS/JS) for an animated "Happy Birthday" wish page. No build step, no backend, no tests.

- Structure: `index.html` (markup + GSAP CDN script), `style/style.css` (styling + all visual polish), `script/main.js` (GSAP `TimelineMax` animation), `customize.json` (text/image content injected into the DOM on load).
- Dependencies: only dev tooling (`browser-sync` for the live-reload server). Install with `npm install`.
- Run the dev server: `npm start` uses `run-script-os`, which does NOT reliably resolve the `start:darwin:linux` key on this Linux VM (it prints a "meant to be run from within npm script" message and does nothing). Run the server directly instead:
  `npx browser-sync start --server --files '**/*.css, **/*.html, **/*.js, !node_modules/**/*' --port 7777 --no-open`
  Then open `http://localhost:7777/index.html`. Browser-sync live-reloads on any HTML/CSS/JS change.
- The page auto-plays a ~40s GSAP timeline on load; click the "Or click, if you want to watch it again" text (`#replay`) to replay. There is no way to pause; to re-test from the start, hard-reload the page.
- The GSAP timeline in `script/main.js` is carefully tuned. Prefer visual changes in `style/style.css` and avoid altering timeline timings unless intentionally changing motion.
- GSAP is pinned to the v1.20.3 CDN build (`TweenMax`/`TimelineMax` API). Don't "upgrade" to GSAP 3 syntax without rewriting the timeline.
- Note: `.wish-hbd span` color and `.fake-btn`/`.idea-3 strong` background are set by GSAP at runtime, so don't rely purely on CSS for their final colors.
- Lint/test: none configured (`npm test` intentionally exits 1). Validate changes visually in the browser.
