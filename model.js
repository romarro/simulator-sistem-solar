(() => {
  "use strict";

  // Distances and periods use NASA's planetary fact sheet, rounded for this model.
  const bodies = [
    { id: "sun", name: "Soarele", color: "#ffc65e", size: 15, distance: 0, period: 0, phase: 0 },
    { id: "mercury", name: "Mercur", color: "#aebac7", size: 5, distance: 57.9 / 149.6, period: 88, phase: 2.7 },
    { id: "venus", name: "Venus", color: "#eac08a", size: 7, distance: 108.2 / 149.6, period: 224.7, phase: 4.2 },
    { id: "earth", name: "Pământ", color: "#73b5ec", size: 8, distance: 1, period: 365.2, phase: 0.45 },
    { id: "mars", name: "Marte", color: "#e58269", size: 6, distance: 228 / 149.6, period: 687, phase: 2.05 },
    { id: "jupiter", name: "Jupiter", color: "#e6b185", size: 12, distance: 778.5 / 149.6, period: 4331, phase: 5.3 },
    { id: "saturn", name: "Saturn", color: "#e9c995", size: 10, distance: 1432 / 149.6, period: 10747, phase: 3.6 },
    { id: "uranus", name: "Uranus", color: "#9bd8da", size: 9, distance: 2867 / 149.6, period: 30589, phase: 4.65 },
    { id: "neptune", name: "Neptun", color: "#779feb", size: 9, distance: 4515 / 149.6, period: 59800, phase: 1.5 }
  ];

  function position(body, days) {
    if (body.id === "sun") return { x: 0, y: 0 };
    const radius = Math.sqrt(body.distance);
    const angle = body.phase + 2 * Math.PI * days / body.period;
    return { x: radius * Math.cos(angle), y: radius * Math.sin(angle) };
  }

  function relativePosition(body, reference, days) {
    const point = position(body, days);
    const origin = position(reference, days);
    return { x: point.x - origin.x, y: point.y - origin.y };
  }

  function trailDuration(days, lengthPercent, zoom) {
    return Math.min(days, 1461 * lengthPercent / 100 / zoom);
  }

  globalThis.SolarModel = { bodies, position, relativePosition, trailDuration };
})();
