import { describe, expect, it } from "vitest";
import starCatalog from "../data/generated/star-catalog.json";
import deepSkyCatalog from "../data/generated/deep-sky-catalog.json";
import constellationCatalog from "../data/generated/constellation-catalog.json";
import {
  buildPlanetariumCatalog,
} from "../data/planetarium-catalog";
import type {
  CatalogConstellationRow,
  CatalogStarRow,
} from "../data/bright-stars";
import type { DeepSkyCatalogRow } from "../data/deep-sky-objects";
import { AstronomyEnginePlanetarium } from "./astronomy-engine-planetarium";

describe("AstronomyEnginePlanetarium", () => {
  const engine = new AstronomyEnginePlanetarium(buildPlanetariumCatalog(
    starCatalog as unknown as CatalogStarRow[],
    deepSkyCatalog as unknown as DeepSkyCatalogRow[],
    constellationCatalog as unknown as CatalogConstellationRow[],
  ));
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

    expect(scene.objects).toHaveLength(9_539);
    expect(scene.constellationSegments).toHaveLength(674);
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
      { altitude: 87.1, azimuth: 64, id: "vega" },
      { altitude: 63.2, azimuth: 62, id: "deneb" },
      { altitude: 55.2, azimuth: 139.7, id: "altair" },
      { altitude: 37.2, azimuth: 0.6, id: "polaris" },
    ]);
  });

  it("includes naked-eye stars and representative deep-sky objects", () => {
    const scene = engine.calculate(input);

    expect(scene.objects.filter(({ kind }) => kind === "STAR")).toHaveLength(8_920);
    expect(scene.objects.find(({ id }) => id === "dso-ngc0224")).toMatchObject({
      kind: "GALAXY",
      name: "안드로메다 은하",
    });
    expect(scene.objects.find(({ id }) => id === "dso-ngc1976")).toMatchObject({
      kind: "NEBULA",
      name: "오리온 성운",
    });
    expect(new Set(scene.constellationSegments.map(({ constellationId }) => constellationId)).size).toBe(88);
  });
});
