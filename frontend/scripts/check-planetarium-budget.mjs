import { existsSync, readFileSync, statSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { resolve } from "node:path";

const manifestPath = resolve(
  ".next/server/app/sky/page_client-reference-manifest.js",
);
const rawBudgetBytes = 1_200_000;
const gzipBudgetBytes = 350_000;

if (!existsSync(manifestPath)) {
  throw new Error("Build output is missing. Run `npm run build -- --webpack` first.");
}

const source = readFileSync(manifestPath, "utf8");
const marker = '["/sky/page"]=';
const assignment = source.indexOf(marker);
if (assignment < 0) {
  throw new Error("Sky route entry was not found in the build manifest.");
}
const manifest = JSON.parse(source.slice(assignment + marker.length, -1));
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
    const chunkPath = resolve(".next", chunk);
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
