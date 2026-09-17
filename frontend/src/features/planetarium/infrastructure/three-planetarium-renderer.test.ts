import { describe, expect, it } from "vitest";
import { horizontalToCartesian } from "./three-planetarium-renderer";

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
