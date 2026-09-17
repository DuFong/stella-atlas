import { describe, expect, it } from "vitest";
import {
  horizontalToCartesian,
  labelDensityAllows,
  selectionValuesFor,
  shouldUseReducedQuality,
} from "./three-planetarium-renderer";

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

describe("labelDensityAllows", () => {
  it("keeps selected and solar-system labels while reducing dense star labels", () => {
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
      kind: "PLANET",
      quality: "reduced",
      selected: false,
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
