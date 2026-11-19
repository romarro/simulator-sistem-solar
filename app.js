(() => {
  "use strict";

  const { bodies, relativePosition, trailDuration } = SolarModel;
  const referenceInput = document.getElementById("reference");
  const referenceLabel = document.getElementById("reference-label");
  const speedInput = document.getElementById("speed");
  const speedValue = document.getElementById("speed-value");
  const zoomInput = document.getElementById("zoom");
  const zoomValue = document.getElementById("zoom-value");
  const trailsInput = document.getElementById("trails");
  const trailLengthInput = document.getElementById("trail-length");
  const trailLengthValue = document.getElementById("trail-length-value");
  const playButton = document.getElementById("play");
  const timeLabel = document.getElementById("time-label");
  const container = document.getElementById("canvas-container");
  const workspace = document.querySelector(".workspace");
  const controlPanel = document.getElementById("control-panel");
  const fullscreenButton = document.getElementById("fullscreen-toggle");
  const panelButton = document.getElementById("panel-toggle");
  const cardsButton = document.getElementById("cards-toggle");
  const below = document.getElementById("exploration-cards");
  const belowHost = below.parentElement;
  const belowNextSibling = below.nextElementSibling;
  const fullscreenStatus = document.getElementById("fullscreen-status");
  const backgroundSections = document.querySelectorAll(".topbar, .intro, .below, .model-note, footer");
  const speedSteps = [1, 3, 10, 30, 100, 365, 1000];
  const referenceNames = { sun: "Soarele", mercury: "Mercur", venus: "Venus", earth: "Pământul", mars: "Marte", jupiter: "Jupiter" };
  const state = { days: 0, playing: true };

  function updateTime() {
    const text = `Timp simulat: ${Math.floor(state.days).toLocaleString("ro-RO")} zile`;
    if (timeLabel.textContent !== text) timeLabel.textContent = text;
  }

  function updateControls() {
    referenceLabel.textContent = referenceNames[referenceInput.value];
    speedValue.textContent = `${speedSteps[Number(speedInput.value)]} zile / secundă`;
    zoomValue.textContent = `${Number(zoomInput.value).toFixed(1)}×`;
    const trailDays = 1461 * Number(trailLengthInput.value) / 100 / Number(zoomInput.value);
    trailLengthValue.textContent = `${Math.round(trailDays).toLocaleString("ro-RO")} zile`;
    trailLengthInput.disabled = !trailsInput.checked;
    playButton.textContent = state.playing ? "Ⅱ  Pauză" : "▶  Continuă";
    updateTime();
  }

  referenceInput.addEventListener("change", updateControls);
  speedInput.addEventListener("input", updateControls);
  zoomInput.addEventListener("input", updateControls);
  trailLengthInput.addEventListener("input", updateControls);
  trailsInput.addEventListener("change", updateControls);
  document.getElementById("zoom-in").addEventListener("click", () => {
    zoomInput.value = Math.min(Number(zoomInput.max), Number(zoomInput.value) + 0.2);
    updateControls();
  });
  document.getElementById("zoom-out").addEventListener("click", () => {
    zoomInput.value = Math.max(Number(zoomInput.min), Number(zoomInput.value) - 0.2);
    updateControls();
  });
  playButton.addEventListener("click", () => {
    state.playing = !state.playing;
    updateControls();
  });
  document.getElementById("reset").addEventListener("click", () => {
    state.days = 0;
    state.playing = true;
    updateControls();
  });

  function setPresentation(active, fallback = false) {
    workspace.classList.toggle("is-presentation", active);
    workspace.classList.toggle("presentation-fallback", active && fallback);
    document.body.classList.toggle("presentation-open", active && fallback);
    if (active) {
      workspace.appendChild(below);
    } else {
      below.hidden = false;
      cardsButton.hidden = true;
      cardsButton.setAttribute("aria-expanded", "true");
      cardsButton.textContent = "Ascunde cardurile";
      belowHost.insertBefore(below, belowNextSibling);
    }
    for (const section of backgroundSections) section.inert = active && fallback;
    fullscreenButton.setAttribute("aria-pressed", String(active));
    fullscreenButton.textContent = active ? "⛶  Ieși din ecran complet" : "⛶  Ecran complet";
    panelButton.hidden = !active;
    cardsButton.hidden = !active;
    controlPanel.hidden = false;
    panelButton.setAttribute("aria-expanded", "true");
    panelButton.textContent = "Ascunde comenzile";
    if (!active) {
      fullscreenStatus.hidden = true;
      fullscreenButton.focus();
    }
  }

  fullscreenButton.addEventListener("click", async () => {
    if (workspace.classList.contains("is-presentation")) {
      if (document.fullscreenElement === workspace) {
        try {
          await document.exitFullscreen();
        } catch (error) {
          fullscreenStatus.textContent = `Nu s-a putut închide ecranul complet: ${error.message}`;
          fullscreenStatus.hidden = false;
        }
      } else {
        setPresentation(false);
      }
      return;
    }
    if (document.fullscreenEnabled && workspace.requestFullscreen) {
      try {
        await workspace.requestFullscreen();
        return;
      } catch (error) {
        fullscreenStatus.textContent = `Ecranul complet nu este disponibil (${error.message}). Este folosită fereastra browserului.`;
      }
    } else {
      fullscreenStatus.textContent = "Ecranul complet nu este disponibil. Este folosită fereastra browserului.";
    }
    fullscreenStatus.hidden = false;
    setPresentation(true, true);
  });

  document.addEventListener("fullscreenchange", () => {
    if (document.fullscreenElement === workspace) setPresentation(true);
    else if (!workspace.classList.contains("presentation-fallback") && workspace.classList.contains("is-presentation")) setPresentation(false);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && workspace.classList.contains("presentation-fallback")) setPresentation(false);
  });
  panelButton.addEventListener("click", () => {
    controlPanel.hidden = !controlPanel.hidden;
    panelButton.setAttribute("aria-expanded", String(!controlPanel.hidden));
    panelButton.textContent = controlPanel.hidden ? "Arată comenzile" : "Ascunde comenzile";
  });
  cardsButton.addEventListener("click", () => {
    below.hidden = !below.hidden;
    cardsButton.setAttribute("aria-expanded", String(!below.hidden));
    cardsButton.textContent = below.hidden ? "Arată cardurile" : "Ascunde cardurile";
  });

  const exploreCard = below.querySelector(".explore-card");
  const resizeHandle = exploreCard.querySelector(".card-resize-handle");

  function resizeExploreCard(width, height) {
    const maxWidth = Math.max(320, below.clientWidth - 300);
    const nextWidth = Math.round(Math.min(maxWidth, Math.max(320, width)));
    const nextHeight = Math.round(Math.min(480, Math.max(160, height)));
    const widthGrowth = Math.max(0, nextWidth - 415) / 485;
    const heightGrowth = Math.max(0, nextHeight - 185) / 295;
    const textGrowth = Math.min(4.5, 1.5 * widthGrowth + 3 * heightGrowth);

    exploreCard.style.width = `${nextWidth}px`;
    exploreCard.style.height = `${nextHeight}px`;
    exploreCard.style.setProperty("--explore-font-size", `${11 + textGrowth}px`);
    exploreCard.style.setProperty("--explore-heading-size", `${16 + textGrowth * 0.55}px`);
  }

  resizeHandle.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    resizeHandle.setPointerCapture(event.pointerId);
    const startWidth = exploreCard.getBoundingClientRect().width;
    const startHeight = exploreCard.getBoundingClientRect().height;
    const startX = event.clientX;
    const startY = event.clientY;

    const onPointerMove = (moveEvent) => {
      resizeExploreCard(
        startWidth + moveEvent.clientX - startX,
        startHeight - (moveEvent.clientY - startY)
      );
    };
    const onPointerUp = () => {
      resizeHandle.removeEventListener("pointermove", onPointerMove);
      resizeHandle.removeEventListener("pointerup", onPointerUp);
      resizeHandle.removeEventListener("pointercancel", onPointerUp);
    };
    resizeHandle.addEventListener("pointermove", onPointerMove);
    resizeHandle.addEventListener("pointerup", onPointerUp);
    resizeHandle.addEventListener("pointercancel", onPointerUp);
  });

  resizeHandle.addEventListener("keydown", (event) => {
    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) return;
    event.preventDefault();
    const rect = exploreCard.getBoundingClientRect();
    const widthDelta = event.key === "ArrowRight" ? 24 : event.key === "ArrowLeft" ? -24 : 0;
    const heightDelta = event.key === "ArrowUp" ? 24 : event.key === "ArrowDown" ? -24 : 0;
    resizeExploreCard(rect.width + widthDelta, rect.height + heightDelta);
  });
  updateControls();

  new p5((p) => {
    let stars;

    p.setup = () => {
      const canvas = p.createCanvas(container.clientWidth, container.clientHeight);
      canvas.elt.setAttribute("role", "img");
      canvas.elt.setAttribute("aria-label", "Animație a Soarelui și a celor opt planete în sistemul de referință selectat. Folosește comenzile alăturate pentru explorare.");
      p.pixelDensity(Math.min(window.devicePixelRatio || 1, 2));
      p.randomSeed(42);
      stars = Array.from({ length: 95 }, () => [p.random(), p.random(), p.random(0.7, 2)]);
      new ResizeObserver(() => p.resizeCanvas(container.clientWidth, container.clientHeight)).observe(container);
    };

    function screenPoint(body, reference, time, scale) {
      const point = relativePosition(body, reference, time);
      const center = animationCenter();
      return { x: center.x + point.x * scale, y: center.y - point.y * scale };
    }

    function animationCenter() {
      if (!workspace.classList.contains("is-presentation") || below.hidden) {
        return { x: p.width / 2, y: p.height / 2 };
      }

      const canvasRect = container.getBoundingClientRect();
      const cardsRect = below.getBoundingClientRect();
      const controlRect = controlPanel.hidden ? null : controlPanel.getBoundingClientRect();
      const inset = 16;
      const left = inset;
      const top = inset;
      const right = controlRect
        ? Math.min(p.width - inset, controlRect.left - canvasRect.left - inset)
        : p.width - inset;
      const bottom = Math.min(p.height - inset, cardsRect.top - canvasRect.top - inset);

      return {
        x: left + Math.max(0, right - left) / 2,
        y: top + Math.max(0, bottom - top) / 2
      };
    }

    function drawBackground() {
      p.background("#10172a");
      p.noStroke();
      for (const [x, y, size] of stars) {
        p.fill(192, 206, 232, size * 42);
        p.circle(x * p.width, y * p.height, size);
      }
    }

    function drawOrbits(reference, scale) {
      const sun = screenPoint(bodies[0], reference, state.days, scale);
      p.noFill();
      p.stroke(139, 158, 191, 24);
      p.strokeWeight(1);
      for (const body of bodies.slice(1)) {
        p.circle(sun.x, sun.y, 2 * Math.sqrt(body.distance) * scale);
      }
    }

    function drawTrails(reference, scale) {
      const duration = trailDuration(state.days, Number(trailLengthInput.value), Number(zoomInput.value));
      const start = state.days - duration;
      if (start === state.days) return;
      for (const body of bodies) {
        if (body.id === reference.id) continue;
        const fastestPeriod = Math.min(body.period || Infinity, reference.period || Infinity);
        const count = Math.max(2, Math.ceil(duration / (fastestPeriod / 24)));
        const trailColor = p.color(body.color);
        let previous = screenPoint(body, reference, start, scale);
        for (let i = 1; i <= count; i++) {
          const current = screenPoint(body, reference, start + (state.days - start) * i / count, scale);
          trailColor.setAlpha(8 + 165 * i / count);
          p.stroke(trailColor);
          p.strokeWeight(1.7);
          p.line(previous.x, previous.y, current.x, current.y);
          previous = current;
        }
      }
    }

    function drawBody(body, point, isReference) {
      const { x, y } = point;
      if (x < -40 || y < -40 || x > p.width + 40 || y > p.height + 40) return;
      p.push();
      p.translate(x, y);
      if (isReference) {
        p.noFill();
        p.stroke(255, 213, 164, 120);
        p.strokeWeight(1);
        p.circle(0, 0, body.size * 2 + 15);
      }
      if (body.id === "sun") {
        p.noStroke();
        p.fill(255, 191, 82, 25);
        p.circle(0, 0, body.size * 3);
      }
      if (body.id === "saturn") {
        p.noFill();
        p.stroke("#e9c995");
        p.strokeWeight(2);
        p.ellipse(0, 0, body.size * 3, body.size);
      }
      p.noStroke();
      p.fill(body.color);
      p.circle(0, 0, body.size * 2);
      if (body.id === "earth") {
        p.fill("#8cc89d");
        p.ellipse(-2, -2, 7, 5);
        p.ellipse(3, 3, 5, 6);
      } else if (body.id === "jupiter") {
        p.stroke("#b87e66");
        p.strokeWeight(2);
        p.line(-9, -3, 9, -3);
        p.line(-10, 3, 10, 3);
      } else if (body.id === "mars") {
        p.fill("#b9604d");
        p.circle(2, -2, 4);
      }
      p.pop();
    }

    function drawLabels(points) {
      p.noStroke();
      p.fill(225, 233, 246, 230);
      p.textFont("sans-serif");
      p.textSize(11);
      p.textAlign(p.LEFT, p.TOP);
      const placed = [];
      const overlaps = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
      const obstacles = points.map(({ body, point }) => ({
        x: point.x - body.size - 2, y: point.y - body.size - 2, w: body.size * 2 + 4, h: body.size * 2 + 4
      }));
      for (const { body, point } of points) {
        const w = p.textWidth(body.name) + 4;
        const h = 14;
        const gap = body.size + 5;
        const candidates = [
          { x: point.x - w / 2, y: point.y + gap, w, h },
          { x: point.x - w / 2, y: point.y - gap - h, w, h },
          { x: point.x + gap, y: point.y - h / 2, w, h },
          { x: point.x - gap - w, y: point.y - h / 2, w, h }
        ];
        const label = candidates.find((candidate) =>
          candidate.x >= 0 && candidate.y >= 0 &&
          candidate.x + w <= p.width && candidate.y + h <= p.height &&
          !placed.some((other) => overlaps(candidate, other)) &&
          !obstacles.some((other) => overlaps(candidate, other))
        );
        if (label) {
          p.text(body.name, label.x + 2, label.y);
          placed.push(label);
        }
      }
    }

    p.draw = () => {
      if (state.playing) {
        state.days += Math.min(p.deltaTime / 1000, 0.1) * speedSteps[Number(speedInput.value)];
        updateControls();
      }
      const reference = bodies.find((body) => body.id === referenceInput.value);
      const scale = Math.min(p.width, p.height) * 0.44 / 8 * Number(zoomInput.value);
      drawBackground();
      if (reference.id === "sun") drawOrbits(reference, scale);
      if (trailsInput.checked) drawTrails(reference, scale);
      const points = bodies.map((body) => ({ body, point: screenPoint(body, reference, state.days, scale) }));
      for (const { body, point } of points) drawBody(body, point, body.id === reference.id);
      drawLabels(points);
    };
  }, container);
})();
