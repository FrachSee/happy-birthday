// Background music with an autoplay-policy-safe start and a mute toggle.
// Admin-configurable: volume + autoplay default (localStorage "hbdAudio") and
// an optional replacement track stored as a Blob in IndexedDB.
(function () {
  const bgm = document.getElementById("bgm");
  const btn = document.getElementById("music-toggle");
  if (!bgm || !btn) return;

  const icon = btn.querySelector(".ctrl-icon");
  const ICON_ON = "\u{1F50A}"; // speaker on
  const ICON_OFF = "\u{1F507}"; // speaker muted
  const DEFAULT_SRC = bgm.getAttribute("src");

  // Admin settings (tiny, read synchronously).
  const settings = (() => {
    try {
      const s = JSON.parse(localStorage.getItem("hbdAudio"));
      return s && typeof s === "object" ? s : {};
    } catch (e) {
      return {};
    }
  })();
  const TARGET_VOL = Math.min(1, Math.max(0, Number.isFinite(settings.volume) ? settings.volume : 0.55));
  const autoplayAllowed = settings.autoplay !== false;

  // User's explicit per-session choice always wins over the admin default.
  const storedMuted = localStorage.getItem("hbdMuted");
  let userMuted = storedMuted !== null ? storedMuted === "true" : !autoplayAllowed;
  let usingCustom = false;

  bgm.volume = 0;

  const updateIcon = () => {
    const playing = !bgm.paused && !userMuted;
    icon.textContent = playing ? ICON_ON : ICON_OFF;
    btn.classList.toggle("is-muted", !playing);
    btn.setAttribute("aria-pressed", String(playing));
    btn.title = playing ? "Mute music" : "Play music";
  };

  const fadeIn = () => {
    const step = () => {
      if (bgm.paused) return;
      bgm.volume = Math.min(TARGET_VOL, bgm.volume + 0.03);
      if (bgm.volume < TARGET_VOL) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

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

  // If a custom track fails to load, fall back to the bundled one once; only
  // hide the button if even the default is unavailable.
  bgm.addEventListener("error", () => {
    if (usingCustom) {
      usingCustom = false;
      bgm.src = DEFAULT_SRC;
      bgm.load();
      tryPlay();
    } else {
      btn.hidden = true;
    }
  });

  // ---- Optional custom track from IndexedDB ----
  const openDb = () =>
    new Promise((res, rej) => {
      const r = indexedDB.open("hbd-audio", 1);
      r.onupgradeneeded = () => r.result.createObjectStore("tracks");
      r.onsuccess = () => res(r.result);
      r.onerror = () => rej(r.error);
    });

  const getTrack = (db) =>
    new Promise((res, rej) => {
      const tx = db.transaction("tracks", "readonly").objectStore("tracks").get("bgm");
      tx.onsuccess = () => res(tx.result);
      tx.onerror = () => rej(tx.error);
    });

  const loadCustomTrack = () =>
    openDb()
      .then(getTrack)
      .then((rec) => {
        if (rec && rec.blob) {
          usingCustom = true;
          btn.hidden = false;
          bgm.src = URL.createObjectURL(rec.blob);
        }
      })
      .catch(() => {});

  loadCustomTrack().then(() => {
    updateIcon();
    tryPlay();
  });
})();
