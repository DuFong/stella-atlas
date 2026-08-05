import { parse } from "exifr/dist/lite.esm.mjs";

export type PhotoMetadata = {
  capturedAt?: string;
  latitude?: number;
  longitude?: number;
};

type ExifResult = {
  DateTimeOriginal?: Date;
  CreateDate?: Date;
  latitude?: number;
  longitude?: number;
};

export type PhotoMetadataParser = (file: Blob) => Promise<ExifResult | undefined>;

const defaultParser: PhotoMetadataParser = (file) =>
  parse(file, true) as Promise<ExifResult | undefined>;

export async function readPhotoMetadata(
  file: Blob,
  parser: PhotoMetadataParser = defaultParser,
): Promise<PhotoMetadata> {
  try {
    const metadata = await parser(file);
    const capturedAt = metadata?.DateTimeOriginal ?? metadata?.CreateDate;
    return {
      capturedAt:
        capturedAt instanceof Date && !Number.isNaN(capturedAt.getTime())
          ? capturedAt.toISOString()
          : undefined,
      latitude: finiteOrUndefined(metadata?.latitude),
      longitude: finiteOrUndefined(metadata?.longitude),
    };
  } catch {
    return {};
  }
}

function finiteOrUndefined(value: number | undefined): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}
