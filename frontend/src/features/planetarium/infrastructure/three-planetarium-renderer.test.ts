import { describe, expect, it } from "vitest";
import {
  horizontalToCartesian,
  isRenderableObject,
  landscapeAltitudeForAzimuth,
  labelDensityAllows,
  pointSizeFor,
  selectionValuesFor,
  shouldCreateObjectLabel,
  shouldUseReducedQuality,
  solarSystemVisualStyle,
} from "./three-planetarium-renderer";

describe("isRenderableObject", () => {
  it("keeps the twilight Sun for a localized corona and hides other objects below the horizon", () => {
    expect(isRenderableObject({
      id: "sun",
      kind: "SUN",
      name: "태양",
      altitudeDegrees: -12,
      azimuthDegrees: 270,
      color: "#fff4c2",
    })).toBe(true);
    expect(isRenderableObject({
      id: "sirius",
      kind: "STAR",
      name: "시리우스",
      altitudeDegrees: -1,
      azimuthDegrees: 180,
      color: "#ffffff",
    })).toBe(false);
  });
});

describe("horizontalToCartesian", () => {
  it.each([
    { altitude: 0, azimuth: 0, expected: [0, 0, -1] },
    { altitude: 0, azimuth: 90, expected: [1, 0, 0] },
    { altitude: 90, azimuth: 0, expected: [0, 1, 0] },
  ])(
    "maps altitude $altitude and azimuth $azimuth into the observer frame",
    ({ altitude, azimuth, expected }) => {
      const result = horizontalToCartesian(altitude, azimuth);

      expect(result.x).toBeCloseTo(expected[0], 10);
      expect(result.y).toBeCloseTo(expected[1], 10);
      expect(result.z).toBeCloseTo(expected[2], 10);
      expect(result.length()).toBeCloseTo(1, 10);
    },
  );
});

describe("selectionValuesFor", () => {
  it("marks only the selected object for GPU highlighting", () => {
    expect(
      selectionValuesFor(
        [{ id: "sirius" }, { id: "moon" }, { id: "mars" }],
        "moon",
      ),
    ).toEqual([0, 1, 0]);
  });
});

describe("solar-system visuals", () => {
  const object = (
    id: string,
    kind: "SUN" | "MOON" | "PLANET" | "STAR",
  ) => ({
    id,
    kind,
    name: id,
    altitudeDegrees: 30,
    azimuthDegrees: 180,
    color: "#ffffff",
    magnitude: kind === "STAR" ? -1.5 : undefined,
  });

  it("assigns a distinct procedural style to each solar-system body", () => {
    expect(solarSystemVisualStyle(object("sun", "SUN"))).toBe(1);
    expect(solarSystemVisualStyle(object("moon", "MOON"))).toBe(2);
    expect(solarSystemVisualStyle(object("jupiter", "PLANET"))).toBe(6);
    expect(solarSystemVisualStyle(object("saturn", "PLANET"))).toBe(7);
    expect(solarSystemVisualStyle(object("sirius", "STAR"))).toBe(0);
  });

  it("omits solar-system labels while retaining eligible catalog labels", () => {
    expect(shouldCreateObjectLabel(object("moon", "MOON"))).toBe(false);
    expect(shouldCreateObjectLabel(object("mars", "PLANET"))).toBe(false);
    expect(shouldCreateObjectLabel({
      ...object("sirius", "STAR"),
      labelEligible: true,
    })).toBe(true);
  });

  it("renders solar-system bodies at least three times larger than a bright star", () => {
    const brightStarSize = pointSizeFor(object("sirius", "STAR"));

    expect(pointSizeFor(object("moon", "MOON"))).toBeGreaterThanOrEqual(brightStarSize * 3);
    expect(pointSizeFor(object("mars", "PLANET"))).toBeGreaterThanOrEqual(brightStarSize * 3);
    expect(pointSizeFor(object("saturn", "PLANET"))).toBeLessThanOrEqual(brightStarSize * 4);
    expect(pointSizeFor(object("sun", "SUN"))).toBeGreaterThan(
      pointSizeFor(object("moon", "MOON")),
    );
  });
});

describe("landscapeAltitudeForAzimuth", () => {
  it("creates a bounded, seamless mountain profile around the true horizon", () => {
    const altitudes = Array.from(
      { length: 360 },
      (_, azimuth) => landscapeAltitudeForAzimuth(azimuth),
    );

    expect(Math.min(...altitudes)).toBeGreaterThanOrEqual(0.35);
    expect(Math.max(...altitudes)).toBeLessThanOrEqual(4.9);
    expect(landscapeAltitudeForAzimuth(0)).toBeCloseTo(
      landscapeAltitudeForAzimuth(360),
      10,
    );
  });
});

describe("labelDensityAllows", () => {
  it("keeps selected labels while reducing dense catalog labels", () => {
    expect(labelDensityAllows({
      constellation: false,
      fieldOfView: 90,
      kind: "STAR",
      magnitude: 2,
      quality: "full",
      selected: true,
    })).toBe(true);
    expect(labelDensityAllows({
      constellation: false,
      fieldOfView: 90,
      kind: "STAR",
      magnitude: 1,
      quality: "reduced",
      selected: false,
    })).toBe(false);
    expect(labelDensityAllows({
      constellation: true,
      fieldOfView: 50,
      quality: "full",
      selected: false,
    })).toBe(true);
    expect(labelDensityAllows({
      constellation: false,
      fieldOfView: 90,
      kind: "GALAXY",
      quality: "full",
      selected: false,
    })).toBe(false);
    expect(labelDensityAllows({
      constellation: false,
      fieldOfView: 40,
      kind: "NEBULA",
      quality: "full",
      selected: false,
    })).toBe(true);
  });
});

describe("shouldUseReducedQuality", () => {
  it("waits for a stable sample and compares p95 with viewport budgets", () => {
    expect(shouldUseReducedQuality(Array(19).fill(40), 390)).toBe(false);
    expect(shouldUseReducedQuality(Array(20).fill(34), 390)).toBe(true);
    expect(shouldUseReducedQuality(Array(20).fill(17), 1280)).toBe(true);
    expect(shouldUseReducedQuality(Array(20).fill(12), 1280)).toBe(false);
  });
});
