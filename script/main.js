// Import the data to customize and insert them into page
const readOverrides = () => {
  // Admin-panel overrides live in localStorage. Guard against malformed or
  // non-object payloads so a bad value can never blank the whole page.
  try {
    const parsed = JSON.parse(localStorage.getItem("hbdOverrides"));
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed;
    }
  } catch (e) {
    /* ignore */
  }
  return {};
};

const applyData = (data) => {
  Object.keys(data).forEach((key) => {
    if (data[key] === "") return;
    // Exact-match selector so keys that are substrings of others (e.g. "text4"
    // vs "text4Adjective") can never land on the wrong element.
    const el = document.querySelector(`[data-node-name="${key}"]`);
    if (!el) return;
    if (key === "imagePath") {
      el.setAttribute("src", data[key]);
    } else {
      el.innerText = data[key];
    }
  });
};

// Import the data to customize and insert them into page
const fetchData = () => {
  fetch("customize.json")
    .then(res => res.json())
    .then(defaults => {
      // Overlay any admin overrides on top of the JSON defaults. Replacing the
      // photo only sets `imagePath`, so the other settings are never disturbed.
      const data = Object.assign({}, defaults, readOverrides());
      applyData(data);
      animationTimeline();
    })
    .catch(() => {
      // If customize.json can't be loaded (e.g. opened via file://), still play
      // the animation with the hard-coded HTML text.
      animationTimeline();
    });
};

// Animation Timeline
const animationTimeline = () => {
  // Split chars that need to be animated individually. Use innerText +
  // Array.from so emoji (surrogate pairs) stay intact, and escape HTML so
  // characters like & or < don't turn into literal entities.
  const splitChars = (el) => {
    const esc = (c) => c.replace(/&/g, "&amp;").replace(/</g, "&lt;");
    el.innerHTML = Array.from(el.innerText)
      .map((c) => `<span>${esc(c)}</span>`)
      .join("");
  };

  const textBoxChars = document.getElementsByClassName("hbd-chatbox")[0];
  const hbd = document.getElementsByClassName("wish-hbd")[0];

  splitChars(textBoxChars);
  splitChars(hbd);

  const ideaTextTrans = {
    opacity: 0,
    y: -20,
    rotationX: 5,
    skewX: "15deg"
  };

  const ideaTextTransLeave = {
    opacity: 0,
    y: 20,
    rotationY: 5,
    skewX: "-15deg"
  };

  const tl = new TimelineMax();

  tl
    .to(".container", 0.1, {
      visibility: "visible"
    })
    .from(".one", 0.7, {
      opacity: 0,
      y: 10
    })
    .from(".two", 0.4, {
      opacity: 0,
      y: 10
    })
    .to(
      ".one",
      0.7,
      {
        opacity: 0,
        y: 10
      },
      "+=2.5"
    )
    .to(
      ".two",
      0.7,
      {
        opacity: 0,
        y: 10
      },
      "-=1"
    )
    .from(".three", 0.7, {
      opacity: 0,
      y: 10
      // scale: 0.7
    })
    .to(
      ".three",
      0.7,
      {
        opacity: 0,
        y: 10
      },
      "+=2"
    )
    .from(".four", 0.7, {
      scale: 0.2,
      opacity: 0
    })
    .from(".fake-btn", 0.3, {
      scale: 0.2,
      opacity: 0
    })
    .staggerTo(
      ".hbd-chatbox span",
      0.5,
      {
        visibility: "visible"
      },
      0.05
    )
    .to(".fake-btn", 0.1, {
      backgroundColor: "rgb(127, 206, 248)"
    })
    .to(
      ".four",
      0.5,
      {
        scale: 0.2,
        opacity: 0,
        y: -150
      },
      "+=0.7"
    )
    .from(".idea-1", 0.7, ideaTextTrans)
    .to(".idea-1", 0.7, ideaTextTransLeave, "+=1.5")
    .from(".idea-2", 0.7, ideaTextTrans)
    .to(".idea-2", 0.7, ideaTextTransLeave, "+=1.5")
    .from(".idea-3", 0.7, ideaTextTrans)
    .to(".idea-3 strong", 0.5, {
      scale: 1.2,
      x: 10,
      backgroundColor: "rgb(21, 161, 237)",
      color: "#fff"
    })
    .to(".idea-3", 0.7, ideaTextTransLeave, "+=1.5")
    .from(".idea-4", 0.7, ideaTextTrans)
    .to(".idea-4", 0.7, ideaTextTransLeave, "+=1.5")
    .from(
      ".idea-5",
      0.7,
      {
        rotationX: 15,
        rotationZ: -10,
        skewY: "-5deg",
        y: 50,
        z: 10,
        opacity: 0
      },
      "+=0.5"
    )
    .to(
      ".idea-5 .smiley",
      0.7,
      {
        rotation: 90,
        x: 8
      },
      "+=0.4"
    )
    .to(
      ".idea-5",
      0.7,
      {
        scale: 0.2,
        opacity: 0
      },
      "+=2"
    )
    .staggerFrom(
      ".idea-6 span",
      0.8,
      {
        scale: 3,
        opacity: 0,
        rotation: 15,
        ease: Expo.easeOut
      },
      0.2
    )
    .staggerTo(
      ".idea-6 span",
      0.8,
      {
        scale: 3,
        opacity: 0,
        rotation: -15,
        ease: Expo.easeOut
      },
      0.2,
      "+=1"
    )
    .staggerFromTo(
      ".baloons img",
      2.5,
      {
        opacity: 0.9,
        y: 1400
      },
      {
        opacity: 1,
        y: -1000
      },
      0.2
    )
    .from(
      ".lydia-dp",
      0.5,
      {
        scale: 3.5,
        opacity: 0,
        x: 25,
        y: -25,
        rotationZ: -45
      },
      "-=2"
    )
    .from(".hat", 0.5, {
      x: -100,
      y: 350,
      rotation: -180,
      opacity: 0
    })
    .staggerFrom(
      ".wish-hbd span",
      0.7,
      {
        opacity: 0,
        y: -50,
        // scale: 0.3,
        rotation: 150,
        skewX: "30deg",
        ease: Elastic.easeOut.config(1, 0.5)
      },
      0.1
    )
    .staggerFromTo(
      ".wish-hbd span",
      0.7,
      {
        scale: 1.4,
        rotationY: 150
      },
      {
        scale: 1,
        rotationY: 0,
        color: "#ff69b4",
        ease: Expo.easeOut
      },
      0.1,
      "party"
    )
    .from(
      ".wish h5",
      0.5,
      {
        opacity: 0,
        y: 10,
        skewX: "-15deg"
      },
      "party"
    )
    .staggerTo(
      ".eight svg",
      1.5,
      {
        visibility: "visible",
        opacity: 0,
        scale: 80,
        repeat: 3,
        repeatDelay: 1.4
      },
      0.3
    )
    .to(".six", 0.5, {
      opacity: 0,
      y: 30,
      zIndex: "-1"
    })
    .staggerFrom(".nine p", 1, ideaTextTrans, 1.2)
    .to(
      ".last-smile",
      0.5,
      {
        rotation: 90
      },
      "+=1"
    );

  // tl.seek("currentStep");
  // tl.timeScale(2);

  // Festive confetti. Timeline-safe: callbacks added at a label/position add
  // zero duration and draw on canvas-confetti's own pointer-events:none canvas,
  // so they never touch GSAP's tweened elements or timings. They re-fire on replay.
  const COLORS = ["#ff6ec4", "#7873f5", "#42e695", "#ffd166", "#4dd0e1", "#ff5e7e"];

  // Soft welcome burst as the greeting appears.
  const greetingConfetti = () => {
    if (typeof confetti !== "function") return;
    confetti({
      particleCount: 45,
      spread: 70,
      startVelocity: 26,
      gravity: 0.7,
      scalar: 0.9,
      ticks: 180,
      zIndex: 5,
      colors: COLORS,
      origin: { y: 0.6 },
      disableForReducedMotion: true
    });
  };

  // Big celebration at the "Happy Birthday" reveal, with a delayed echo volley.
  const fireConfetti = () => {
    if (typeof confetti !== "function") return;
    const base = {
      spread: 100,
      startVelocity: 45,
      ticks: 260,
      zIndex: 5,
      colors: COLORS,
      shapes: ["square", "circle", "star"],
      drift: 0,
      disableForReducedMotion: true
    };
    confetti(Object.assign({}, base, { particleCount: 90, angle: 60, scalar: 1.1, drift: 0.4, origin: { x: 0, y: 0.7 } }));
    confetti(Object.assign({}, base, { particleCount: 90, angle: 120, scalar: 1.1, drift: -0.4, origin: { x: 1, y: 0.7 } }));
    confetti(Object.assign({}, base, { particleCount: 70, angle: 90, scalar: 0.8, origin: { x: 0.5, y: 0.35 } }));
    setTimeout(() => {
      confetti(Object.assign({}, base, { particleCount: 60, angle: 75, scalar: 1.3, origin: { x: 0.15, y: 0.6 } }));
      confetti(Object.assign({}, base, { particleCount: 60, angle: 105, scalar: 1.3, origin: { x: 0.85, y: 0.6 } }));
    }, 650);
  };

  tl.addCallback(greetingConfetti, 0.9);
  tl.addCallback(fireConfetti, "party");

  // Restart Animation on click
  const replyBtn = document.getElementById("replay");
  replyBtn.addEventListener("click", () => {
    tl.restart();
  });
};

// Run fetch and animation in sequence
fetchData();