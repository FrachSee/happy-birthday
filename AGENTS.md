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

### Added features (BGM, admin panel, confetti)
- Background music: `music/bgm.mp3` (a self-synthesized, royalty-free loop; regenerate with `python3 scripts_gen/make_bgm.py` then encode to mp3 with ffmpeg). Logic in `script/audio.js`: tries autoplay, and because browsers block audible autoplay it starts on the first user gesture; the top-right speaker button toggles play/pause and the choice persists in `localStorage.hbdMuted`.
- Admin panel: `admin.html` edits the `customize.json` fields and replaces the photo (downscaled via canvas to a JPEG data URL). It saves a SPARSE overrides object to `localStorage.hbdOverrides` (only values that differ from defaults), so replacing the photo never disturbs the text and vice-versa.
- `script/main.js` merges `customize.json` (defaults) with `localStorage.hbdOverrides` before running the animation. Gotcha: a corrupt/foreign `hbdOverrides` value used to be able to blank the page; it is now guarded, but if the wish page ever appears frozen/blank, clearing `localStorage` (or the admin "Reset everything" button) is the first thing to try.
- Confetti uses the `canvas-confetti` CDN, fired via `tl.addCallback(..., "party")` and a greeting burst at position `0.9`. These are zero-duration callbacks on their own canvas and must NOT be turned into GSAP tweens on existing timeline elements.
- Timeline safety rule: extra visual polish (glow/shimmer/ambient/balloon variety) only animates `background`/`filter`/`box-shadow`/`text-shadow`/`width`. Never animate `transform`/`opacity` on elements the GSAP `TimelineMax` owns (`.one`–`.nine`, `.idea-*`, `.baloons img`, `.lydia-dp`, `.hat`, `.wish-hbd span`) or it will fight GSAP's inline styles.
