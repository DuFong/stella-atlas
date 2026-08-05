import { describe, expect, it } from "vitest";
import {
  MAX_IMAGE_BYTES,
  extractHashtags,
  validateImage,
} from "./observation-post";

describe("observation post domain", () => {
  it("extracts unique normalized hashtags while preserving the comment separately", () => {
    expect(extractHashtags("맑은 밤 #달관측 #서울 #달관측 #Night-Sky")).toEqual([
      "달관측",
      "서울",
      "night-sky",
    ]);
  });

  it("rejects unsupported or oversized images", () => {
    expect(validateImage(new Blob(["text"], { type: "text/plain" }))).toBe(
      "이미지 파일만 선택할 수 있습니다.",
    );
    expect(
      validateImage(new Blob([new Uint8Array(MAX_IMAGE_BYTES + 1)], { type: "image/jpeg" })),
    ).toBe("사진은 한 장당 20MB 이하만 저장할 수 있습니다.");
  });
});
