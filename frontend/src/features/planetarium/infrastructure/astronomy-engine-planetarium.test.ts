import { describe, expect, it } from "vitest";
import { AstronomyEnginePlanetarium } from "./astronomy-engine-planetarium";

describe("AstronomyEnginePlanetarium", () => {
  const engine = new AstronomyEnginePlanetarium();
  const input = {
    latitude: 37.5665,
    longitude: 126.978,
    observedAt: new Date("2026-08-05T13:00:00Z"),
  };

  it("calculates a deterministic sky scene for the same location and instant", () => {
    expect(engine.calculate(input)).toEqual(engine.calculate(input));
  });

  it("keeps calculated horizontal coordinates within their valid ranges", () => {
    const scene = engine.calculate(input);

    expect(scene.objects.length).toBeGreaterThan(30);
    expect(scene.constellationSegments.length).toBeGreaterThan(0);
    for (const object of scene.objects) {
      expect(object.altitudeDegrees).toBeGreaterThanOrEqual(-90);
      expect(object.altitudeDegrees).toBeLessThanOrEqual(90);
      expect(object.azimuthDegrees).toBeGreaterThanOrEqual(0);
      expect(object.azimuthDegrees).toBeLessThan(360);
    }
  });

  it("rejects coordinates outside the supported range", () => {
    expect(() => engine.calculate({ ...input, latitude: 91 })).toThrow(
      RangeError,
    );
  });
});
