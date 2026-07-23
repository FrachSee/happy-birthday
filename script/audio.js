// Background music with an autoplay-policy-safe start and a mute toggle.
(function () {
  const bgm = document.getElementById("bgm");
  const btn = document.getElementById("music-toggle");
  if (!bgm || !btn) return;

  const icon = btn.querySelector(".ctrl-icon");
  const ICON_ON = "\u{1F50A}"; // speaker on
  const ICON_OFF = "\u{1F507}"; // speaker muted
  const TARGET_VOL = 0.55;

  // User preference persists across reloads/replays.
  let userMuted = localStorage.getItem("hbdMuted") === "true";

  bgm.volume = 0;

  const updateIcon = () => {
    const playing = !bgm.paused && !userMuted;
    icon.textContent = playing ? ICON_ON : ICON_OFF;
    btn.classList.toggle("is-muted", !playing);
    btn.setAttribute("aria-pressed", String(playing));
    btn.title = playing ? "Mute music" : "Play music";
  };

  // Gentle volume ramp so playback never starts abruptly.
  const fadeIn = () => {
    const step = () => {
      if (bgm.paused) return;
      bgm.volume = Math.min(TARGET_VOL, bgm.volume + 0.03);
      if (bgm.volume < TARGET_VOL) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  // If autoplay is blocked, start on the first real user gesture. The listener
  // ignores clicks on the toggle button itself (its own click handler owns that)
  // to avoid a race where the same gesture both starts and immediately mutes.
  const armGestureStart = () => {
    const start = (e) => {
      if (btn.contains(e.target)) return;
      remove();
      if (!userMuted) bgm.play().catch(() => {});
    };
    const remove = () =>
      ["pointerdown", "keydown", "touchstart"].forEach((ev) =>
        document.removeEventListener(ev, start)
      );
    ["pointerdown", "keydown", "touchstart"].forEach((ev) =>
      document.addEventListener(ev, start)
    );
  };

  const tryPlay = () => {
    if (userMuted) {
      updateIcon();
      return;
    }
    const p = bgm.play();
    if (p && typeof p.then === "function") {
      p.then(updateIcon).catch(armGestureStart);
    } else {
      armGestureStart();
    }
  };

  // Toggle from the actual playback state (a click is a valid user gesture, so
  // play() is always allowed here).
  btn.addEventListener("click", () => {
    const wantPlay = bgm.paused;
    userMuted = !wantPlay;
    localStorage.setItem("hbdMuted", String(userMuted));
    if (wantPlay) {
      bgm.play().catch(() => {});
    } else {
      bgm.pause();
    }
    updateIcon();
  });

  bgm.addEventListener("play", () => {
    fadeIn();
    updateIcon();
  });
  bgm.addEventListener("pause", updateIcon);

  // Degrade gracefully if the audio file fails to load.
  bgm.addEventListener("error", () => {
    btn.hidden = true;
  });

  updateIcon();
  tryPlay();
})();
