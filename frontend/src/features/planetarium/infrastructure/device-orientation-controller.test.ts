import { afterEach, describe, expect, it, vi } from "vitest";
import {
  DeviceOrientationController,
  projectDeviceOrientation,
} from "./device-orientation-controller";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("projectDeviceOrientation", () => {
  it("maps an upright portrait device to the horizon", () => {
    const view = projectDeviceOrientation(0, 90, 0, 0);

    expect(view?.bearingDegrees).toBeCloseTo(0, 5);
    expect(view?.altitudeDegrees).toBeCloseTo(0, 5);
  });

  it("maps a device tilted toward the sky to a positive altitude", () => {
    const view = projectDeviceOrientation(0, 135, 0, 0);

    expect(view?.altitudeDegrees).toBeCloseTo(45, 5);
  });

  it("preserves the viewing direction when only the screen orientation changes", () => {
    const portrait = projectDeviceOrientation(0, 90, 0, 0);
    const landscape = projectDeviceOrientation(0, 90, 0, 90);

    expect(landscape?.bearingDegrees).toBeCloseTo(portrait?.bearingDegrees ?? 0, 5);
    expect(landscape?.altitudeDegrees).toBeCloseTo(portrait?.altitudeDegrees ?? 0, 5);
  });

  it("ignores incomplete sensor readings", () => {
    expect(projectDeviceOrientation(null, 90, 0, 0)).toBeNull();
  });

  it("blocks insecure contexts by default", async () => {
    vi.stubGlobal("isSecureContext", false);
    const controller = new DeviceOrientationController();

    await expect(
      controller.start(
        { bearingDegrees: 0, altitudeDegrees: 28 },
        vi.fn(),
      ),
    ).resolves.toBe("insecure");
  });

});
