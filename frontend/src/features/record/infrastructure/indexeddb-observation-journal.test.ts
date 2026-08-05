import "fake-indexeddb/auto";
import { beforeEach, describe, expect, it } from "vitest";
import { IndexedDbObservationJournal } from "./indexeddb-observation-journal";

describe("IndexedDbObservationJournal", () => {
  beforeEach(async () => {
    await deleteDatabase("stella-atlas-journal");
  });

  it("stores post metadata and image in the local database and updates them", async () => {
    const ids = ["post-1", "image-1"];
    const journal = new IndexedDbObservationJournal(
      indexedDB,
      () => new Date("2026-08-05T12:00:00Z"),
      () => ids.shift()!,
    );

    const saved = await journal.save({
      image: {
        blob: new Blob(["stars"], { type: "image/jpeg" }),
        name: "stars.jpg",
      },
      capturedAt: "2026-08-04T15:00:00Z",
      timeZone: "Asia/Seoul",
      latitude: 37.5665,
      longitude: 126.978,
      comment: "첫 관측 #서울 #달",
      sources: { capturedAt: "exif", location: "exif" },
    });

    expect(saved.hashtags).toEqual(["서울", "달"]);
    expect(await journal.get("image-1")).toBeDefined();
    expect(await journal.list()).toEqual([saved]);

    const updated = await journal.save({
      id: saved.id,
      capturedAt: saved.capturedAt,
      timeZone: saved.timeZone,
      latitude: saved.latitude,
      longitude: saved.longitude,
      comment: "수정한 기록 #달",
      sources: saved.sources,
    });
    expect(updated.image).toEqual(saved.image);
    expect(updated.hashtags).toEqual(["달"]);
  });

  it("deletes post metadata and its image together", async () => {
    const ids = ["post-2", "image-2"];
    const journal = new IndexedDbObservationJournal(
      indexedDB,
      () => new Date("2026-08-05T12:00:00Z"),
      () => ids.shift()!,
    );
    const post = await journal.save({
      image: { blob: new Blob(["stars"], { type: "image/png" }), name: "stars.png" },
      comment: "",
      sources: { capturedAt: "none", location: "none" },
    });

    await journal.delete(post.id);

    expect(await journal.list()).toEqual([]);
    expect(await journal.get(post.image.id)).toBeUndefined();
  });
});

function deleteDatabase(name: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.deleteDatabase(name);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error("Database deletion was blocked."));
  });
}
