const test = require("node:test");
const assert = require("node:assert/strict");
require("./model.js");

const { bodies, position, relativePosition, trailDuration } = globalThis.SolarModel;
const body = (id) => bodies.find((item) => item.id === id);
const near = (a, b) => assert.ok(Math.abs(a - b) < 1e-10, `${a} != ${b}`);

test("the selected reference remains at the origin at any time", () => {
  for (const id of ["sun", "earth", "mars", "jupiter"]) {
    for (const time of [0, 42, 10000]) {
      assert.deepEqual(relativePosition(body(id), body(id), time), { x: 0, y: 0 });
    }
  }
});

test("relative positions use both bodies at the same instant", () => {
  for (const id of ["earth", "mars", "jupiter"]) {
    const time = 300;
    const sunFromPlanet = relativePosition(body("sun"), body(id), time);
    const planetFromSun = relativePosition(body(id), body("sun"), time);
    near(sunFromPlanet.x, -planetFromSun.x);
    near(sunFromPlanet.y, -planetFromSun.y);
    assert.ok(Math.hypot(sunFromPlanet.x, sunFromPlanet.y) > 0);
  }
});

test("a planet completes one circular orbit in its approximate period", () => {
  for (const planet of bodies.slice(1)) {
    const start = position(planet, 0);
    const end = position(planet, planet.period);
    near(start.x, end.x);
    near(start.y, end.y);
  }
});

test("trail duration follows its setting and decreases as zoom increases", () => {
  assert.equal(trailDuration(10000, 100, 1), 1461);
  assert.equal(trailDuration(10000, 200, 1), 2922);
  assert.equal(trailDuration(10000, 100, 2), 730.5);
  assert.equal(trailDuration(10000, 100, 0.5), 2922);
});

test("trails never extend before the start of the simulation", () => {
  assert.equal(trailDuration(0, 100, 1), 0);
  assert.equal(trailDuration(100, 200, 0.5), 100);
});
