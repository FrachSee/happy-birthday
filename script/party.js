// Continuous, timeline-safe "party" ambience for the whole animation:
// a gentle stream of floating emoji plus periodic small confetti side-bursts.
// Everything lives on its own layer / canvas-confetti canvas, so it never
// touches any element the GSAP timeline animates.
(function () {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const small = window.matchMedia("(max-width: 500px)").matches;

  const EMOJI = ["\u{1F389}", "\u{1F388}", "\u2728", "\u{1F38A}", "\u2B50", "\u{1F49C}"];
  const MAX_LIVE = small ? 8 : 14;

  let layer = null;
  let floatTimer = null;
  let burstTimer = null;
  let partyConfetti = null; // own canvas instance so our z-index never fights main.js's bursts

  const ensureLayer = () => {
    if (layer) return;
    layer = document.createElement("div");
    layer.id = "party-layer";
    layer.setAttribute("aria-hidden", "true");
    document.body.appendChild(layer);
    if (typeof confetti === "function" && confetti.create) {
      const canvas = document.createElement("canvas");
      canvas.style.cssText = "position:fixed;inset:0;width:100%;height:100%";
      layer.appendChild(canvas);
      partyConfetti = confetti.create(canvas, { resize: true, useWorker: true });
    }
  };

  const spawnFloater = () => {
    if (!layer || layer.childElementCount >= MAX_LIVE) return;
    const s = document.createElement("span");
    s.className = "party-float";
    s.textContent = EMOJI[(Math.random() * EMOJI.length) | 0];
    s.style.left = Math.random() * 100 + "vw";
    s.style.fontSize = 16 + Math.random() * 16 + "px";
    s.style.opacity = "1";
    s.style.animationDuration = 7 + Math.random() * 6 + "s";
    s.addEventListener("animationend", () => s.remove());
    layer.appendChild(s);
  };

  const sideBurst = () => {
    const emit = partyConfetti || (typeof confetti === "function" ? confetti : null);
    if (!emit) return;
    const left = Math.random() < 0.5;
    emit({
      particleCount: small ? 6 : 10,
      spread: 55,
      startVelocity: 22,
      scalar: 0.7,
      ticks: 130,
      disableForReducedMotion: true,
      angle: left ? 60 : 120,
      origin: { x: left ? 0 : 1, y: 0.4 + Math.random() * 0.35 }
    });
  };

  const start = () => {
    if (reduced.matches) return;
    ensureLayer();
    stop();
    floatTimer = setInterval(spawnFloater, small ? 700 : 480);
    burstTimer = setInterval(sideBurst, 3500);
    // A couple of immediate floaters so the party is visible right away.
    spawnFloater();
    spawnFloater();
  };

  const stop = () => {
    clearInterval(floatTimer);
    clearInterval(burstTimer);
    floatTimer = burstTimer = null;
  };

  // Pause work when the tab is hidden; resume when visible.
  document.addEventListener("visibilitychange", () => {
    document.hidden ? stop() : start();
  });

  // React live if the user toggles the reduced-motion preference.
  const onReducedChange = (e) => {
    if (e.matches) {
      stop();
      if (partyConfetti && partyConfetti.reset) partyConfetti.reset();
      partyConfetti = null;
      if (layer) {
        layer.remove();
        layer = null;
      }
    } else {
      start();
    }
  };
  if (reduced.addEventListener) reduced.addEventListener("change", onReducedChange);
  else if (reduced.addListener) reduced.addListener(onReducedChange);

  // Extra flourish when the user replays (coexists with main.js's own handler).
  const replay = document.getElementById("replay");
  if (replay) replay.addEventListener("click", sideBurst);

  if (!document.hidden) start();
})();
