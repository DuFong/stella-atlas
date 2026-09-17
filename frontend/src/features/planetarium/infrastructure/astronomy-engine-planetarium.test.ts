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
    expect(scene.milkyWayPoints).toHaveLength(72);
    for (const object of scene.objects) {
      expect(object.altitudeDegrees).toBeGreaterThanOrEqual(-90);
      expect(object.altitudeDegrees).toBeLessThanOrEqual(90);
      expect(object.azimuthDegrees).toBeGreaterThanOrEqual(0);
      expect(object.azimuthDegrees).toBeLessThan(360);
    }
    for (const point of scene.milkyWayPoints) {
      expect(point.altitudeDegrees).toBeGreaterThanOrEqual(-90);
      expect(point.altitudeDegrees).toBeLessThanOrEqual(90);
      expect(point.azimuthDegrees).toBeGreaterThanOrEqual(0);
      expect(point.azimuthDegrees).toBeLessThan(360);
    }
  });

  it("rejects coordinates outside the supported range", () => {
    expect(() => engine.calculate({ ...input, latitude: 91 })).toThrow(
      RangeError,
    );
  });

  it("keeps the representative Seoul sky visual signature stable", () => {
    const scene = engine.calculate(input);
    const signature = ["vega", "deneb", "altair", "polaris"].map((id) => {
      const object = scene.objects.find((candidate) => candidate.id === id);
      if (!object) {
        throw new Error(`Missing regression object: ${id}`);
      }
      return {
        altitude: Number(object.altitudeDegrees.toFixed(1)),
        azimuth: Number(object.azimuthDegrees.toFixed(1)),
        id,
      };
    });

    expect(signature).toEqual([
      { altitude: 87.2, azimuth: 62.9, id: "vega" },
      { altitude: 63.4, azimuth: 62.2, id: "deneb" },
      { altitude: 55.3, azimuth: 140.3, id: "altair" },
      { altitude: 37.2, azimuth: 0.8, id: "polaris" },
    ]);
  });
});
