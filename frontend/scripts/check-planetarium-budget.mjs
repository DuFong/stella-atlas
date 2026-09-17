import { existsSync, readFileSync, statSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { resolve } from "node:path";

const manifestPath = resolve(
  ".next/server/app/sky/page_client-reference-manifest.js",
);
const rawBudgetBytes = 1_200_000;
const gzipBudgetBytes = 350_000;
const catalogRawBudgetBytes = 550_000;
const catalogGzipBudgetBytes = 230_000;
const catalogPaths = [
  "src/features/planetarium/data/generated/star-catalog.json",
  "src/features/planetarium/data/generated/deep-sky-catalog.json",
  "src/features/planetarium/data/generated/constellation-catalog.json",
];

if (!existsSync(manifestPath)) {
  throw new Error("Build output is missing. Run `npm run build` first.");
}

const source = readFileSync(manifestPath, "utf8");
const assignment = source.match(
  /globalThis\.__RSC_MANIFEST\["\/sky\/page"\]\s*=\s*/,
);
if (!assignment || assignment.index === undefined) {
  throw new Error("Sky route entry was not found in the build manifest.");
}
const manifestSource = source
  .slice(assignment.index + assignment[0].length)
  .replace(/;\s*$/, "");
const manifest = JSON.parse(manifestSource);
const simulatorEntry = Object.entries(manifest.clientModules).find(([modulePath]) =>
  modulePath.endsWith("/features/planetarium/components/sky-simulator.tsx"),
);

if (!simulatorEntry) {
  throw new Error("Sky simulator client entry was not found in the build manifest.");
}

const chunks = [...new Set(
  simulatorEntry[1].chunks.filter((chunk) =>
    typeof chunk === "string" && chunk.endsWith(".js"),
  ),
)];
const totals = chunks.reduce(
  (result, chunk) => {
    const chunkPath = resolve(".next", chunk.replace(/^\/?_next\//, ""));
    const contents = readFileSync(chunkPath);
    return {
      raw: result.raw + statSync(chunkPath).size,
      gzip: result.gzip + gzipSync(contents).byteLength,
    };
  },
  { raw: 0, gzip: 0 },
);

if (totals.raw > rawBudgetBytes || totals.gzip > gzipBudgetBytes) {
  throw new Error(
    `Planetarium route exceeds its JavaScript budget: ${totals.raw} raw / ${totals.gzip} gzip bytes.`,
  );
}

console.log(
  `Planetarium JavaScript: ${totals.raw} raw / ${totals.gzip} gzip bytes across ${chunks.length} chunks.`,
);

const catalogTotals = catalogPaths.reduce(
  (result, path) => {
    const contents = readFileSync(resolve(path));
    return {
      raw: result.raw + contents.byteLength,
      gzip: result.gzip + gzipSync(contents).byteLength,
    };
  },
  { raw: 0, gzip: 0 },
);

if (
  catalogTotals.raw > catalogRawBudgetBytes ||
  catalogTotals.gzip > catalogGzipBudgetBytes
) {
  throw new Error(
    `Planetarium async catalog exceeds its budget: ${catalogTotals.raw} raw / ${catalogTotals.gzip} gzip bytes.`,
  );
}

console.log(
  `Planetarium async catalog: ${catalogTotals.raw} raw / ${catalogTotals.gzip} gzip bytes.`,
);
