export const LOCAL_POST_SCHEMA_VERSION = 1 as const;
export const MAX_IMAGE_BYTES = 20 * 1024 * 1024;
export const MAX_COMMENT_LENGTH = 500;

export type FieldSource = "exif" | "capture" | "user" | "none";

export type ObservationPost = {
  id: string;
  image: {
    id: string;
    name: string;
    type: string;
    size: number;
  };
  capturedAt?: string;
  timeZone?: string;
  latitude?: number;
  longitude?: number;
  comment: string;
  hashtags: string[];
  sources: {
    capturedAt: FieldSource;
    location: FieldSource;
  };
  createdAt: string;
  updatedAt: string;
  schemaVersion: typeof LOCAL_POST_SCHEMA_VERSION;
};

export type SaveObservationPost = {
  id?: string;
  image?: {
    blob: Blob;
    name: string;
  };
  capturedAt?: string;
  timeZone?: string;
  latitude?: number;
  longitude?: number;
  comment: string;
  sources: ObservationPost["sources"];
};

export function extractHashtags(comment: string): string[] {
  const tags = comment.match(/#[\p{L}\p{N}_-]+/gu) ?? [];
  return [...new Set(tags.map((tag) => tag.slice(1).toLocaleLowerCase("ko-KR")))];
}

export function validateImage(file: Blob): string | undefined {
  if (!file.type.startsWith("image/")) {
    return "이미지 파일만 선택할 수 있습니다.";
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return "사진은 한 장당 20MB 이하만 저장할 수 있습니다.";
  }
  return undefined;
}
