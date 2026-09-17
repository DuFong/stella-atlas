import {
  BRIGHT_STARS,
  CONSTELLATIONS,
  buildBrightStars,
  buildConstellations,
  type BrightStar,
  type CatalogConstellationRow,
  type CatalogStarRow,
  type ConstellationDefinition,
} from "./bright-stars";
import {
  DEEP_SKY_OBJECTS,
  buildDeepSkyObjects,
  type DeepSkyCatalogRow,
  type DeepSkyObject,
} from "./deep-sky-objects";

export type PlanetariumCatalog = {
  stars: readonly BrightStar[];
  deepSkyObjects: readonly DeepSkyObject[];
  constellations: readonly ConstellationDefinition[];
};

export const CORE_PLANETARIUM_CATALOG: PlanetariumCatalog = {
  stars: BRIGHT_STARS,
  deepSkyObjects: DEEP_SKY_OBJECTS,
  constellations: CONSTELLATIONS,
};

export async function loadExtendedPlanetariumCatalog(): Promise<PlanetariumCatalog> {
  const [starModule, deepSkyModule, constellationModule] = await Promise.all([
    import("./generated/star-catalog.json"),
    import("./generated/deep-sky-catalog.json"),
    import("./generated/constellation-catalog.json"),
  ]);
  return buildPlanetariumCatalog(
    starModule.default as unknown as CatalogStarRow[],
    deepSkyModule.default as unknown as DeepSkyCatalogRow[],
    constellationModule.default as unknown as CatalogConstellationRow[],
  );
}

export function buildPlanetariumCatalog(
  starRows: readonly CatalogStarRow[],
  deepSkyRows: readonly DeepSkyCatalogRow[],
  constellationRows: readonly CatalogConstellationRow[],
): PlanetariumCatalog {
  const stars = buildBrightStars(starRows);
  return {
    stars,
    deepSkyObjects: buildDeepSkyObjects(deepSkyRows),
    constellations: buildConstellations(constellationRows, stars),
  };
}
