declare module "exifr/dist/lite.esm.mjs" {
  export function parse(
    input: Blob,
    options?: boolean | Record<string, unknown>,
  ): Promise<Record<string, unknown> | undefined>;
}
