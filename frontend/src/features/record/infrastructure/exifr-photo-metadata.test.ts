import { describe, expect, it, vi } from "vitest";
import { readPhotoMetadata } from "./exifr-photo-metadata";

describe("readPhotoMetadata", () => {
  it("maps EXIF capture time and GPS coordinates", async () => {
    const parser = vi.fn().mockResolvedValue({
      DateTimeOriginal: new Date("2026-08-05T12:00:00Z"),
      latitude: 37.5665,
      longitude: 126.978,
    });

    await expect(
      readPhotoMetadata(new Blob(["photo"], { type: "image/jpeg" }), parser),
    ).resolves.toEqual({
      capturedAt: "2026-08-05T12:00:00.000Z",
      latitude: 37.5665,
      longitude: 126.978,
    });
  });

  it("returns empty metadata for unreadable images", async () => {
    const parser = vi.fn(async () => {
      throw new Error("broken EXIF");
    });

    await expect(
      readPhotoMetadata(new Blob(["photo"], { type: "image/jpeg" }), parser),
    ).resolves.toEqual({});
  });
});
