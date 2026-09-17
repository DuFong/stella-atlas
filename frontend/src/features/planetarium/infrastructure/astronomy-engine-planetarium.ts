import {
  Body,
  Equator,
  Horizon,
  Observer,
  Rotation_EQJ_EQD,
} from "astronomy-engine";
import {
  CORE_PLANETARIUM_CATALOG,
  type PlanetariumCatalog,
} from "@/features/planetarium/data/planetarium-catalog";
import type {
  PlanetariumEngine,
  PlanetariumInput,
  PlanetariumScene,
  SkyObject,
  SkyObjectKind,
} from "@/features/planetarium/domain/planetarium";

const SOLAR_SYSTEM_OBJECTS: readonly {
  body: Body;
  name: string;
  kind: SkyObjectKind;
  color: string;
}[] = [
  { body: Body.Sun, name: "태양", kind: "SUN", color: "#ffd76a" },
  { body: Body.Moon, name: "달", kind: "MOON", color: "#f4f0dc" },
  { body: Body.Mercury, name: "수성", kind: "PLANET", color: "#d7c6af" },
  { body: Body.Venus, name: "금성", kind: "PLANET", color: "#ffe1a8" },
  { body: Body.Mars, name: "화성", kind: "PLANET", color: "#ff856d" },
  { body: Body.Jupiter, name: "목성", kind: "PLANET", color: "#f1cf9e" },
  { body: Body.Saturn, name: "토성", kind: "PLANET", color: "#ead48e" },
  { body: Body.Uranus, name: "천왕성", kind: "PLANET", color: "#9ee7eb" },
  { body: Body.Neptune, name: "해왕성", kind: "PLANET", color: "#7ca8ff" },
] as const;

export class AstronomyEnginePlanetarium implements PlanetariumEngine {
  private catalog: PlanetariumCatalog;

  constructor(catalog: PlanetariumCatalog = CORE_PLANETARIUM_CATALOG) {
    this.catalog = catalog;
  }

  replaceCatalog(catalog: PlanetariumCatalog): void {
    this.catalog = catalog;
  }

  calculate(input: PlanetariumInput): PlanetariumScene {
    validateInput(input);
    const observer = new Observer(input.latitude, input.longitude, 0);
    const toHorizontal = createJ2000ToHorizontal(input.observedAt, observer);
    const stars = this.catalog.stars.map((star): SkyObject => {
      const horizontal = toHorizontal(
        star.rightAscensionHours,
        star.declinationDegrees,
      );

      return {
        id: star.id,
        name: star.name,
        kind: "STAR",
        altitudeDegrees: horizontal.altitude,
        azimuthDegrees: horizontal.azimuth,
        magnitude: star.magnitude,
        color: star.color,
        aliases: star.aliases,
        labelEligible: star.labelEligible,
      };
    });
    const deepSkyObjects = this.catalog.deepSkyObjects.map((object): SkyObject => {
      const horizontal = toHorizontal(
        object.rightAscensionHours,
        object.declinationDegrees,
      );
      return {
        id: object.id,
        name: object.name,
        kind: object.kind,
        altitudeDegrees: horizontal.altitude,
        azimuthDegrees: horizontal.azimuth,
        magnitude: object.magnitude,
        angularSizeArcMinutes: object.angularSizeArcMinutes,
        color: object.color,
        aliases: object.aliases,
        labelEligible: object.labelEligible,
      };
    });
    const solarSystem = SOLAR_SYSTEM_OBJECTS.map((object): SkyObject => {
      const equatorial = Equator(
        object.body,
        input.observedAt,
        observer,
        true,
        true,
      );
      const horizontal = Horizon(
        input.observedAt,
        observer,
        equatorial.ra,
        equatorial.dec,
        "normal",
      );

      return {
        id: object.body.toLowerCase(),
        name: object.name,
        kind: object.kind,
        altitudeDegrees: horizontal.altitude,
        azimuthDegrees: horizontal.azimuth,
        color: object.color,
      };
    });
    const objects = [...solarSystem, ...stars, ...deepSkyObjects];
    const objectById = new Map(objects.map((object) => [object.id, object]));
    const constellationSegments = this.catalog.constellations.flatMap((constellation) =>
      constellation.segments.map(([fromId, toId]) => ({
        constellationId: constellation.id,
        constellationName: constellation.name,
        from: requiredObject(objectById, fromId),
        to: requiredObject(objectById, toId),
      })),
    );
    const milkyWayPoints = calculateMilkyWayPoints(toHorizontal);

    return {
      observedAt: input.observedAt.toISOString(),
      latitude: input.latitude,
      longitude: input.longitude,
      objects,
      constellationSegments,
      milkyWayPoints,
    };
  }
}

function calculateMilkyWayPoints(
  toHorizontal: ReturnType<typeof createJ2000ToHorizontal>,
): PlanetariumScene["milkyWayPoints"] {
  // Transpose of the standard ICRS-to-Galactic rotation matrix, sampled at
  // Galactic latitude 0. The resulting ICRS coordinates are converted to the
  // observer horizon by Astronomy Engine.
  return Array.from({ length: 72 }, (_, index) => {
    const galacticLongitude = (index * 5 * Math.PI) / 180;
    const galacticX = Math.cos(galacticLongitude);
    const galacticY = Math.sin(galacticLongitude);
    const equatorialX = -0.0548755604 * galacticX - 0.8734370902 * galacticY;
    const equatorialY = 0.4941094279 * galacticX - 0.44482963 * galacticY;
    const equatorialZ = -0.867666149 * galacticX - 0.1980763734 * galacticY;
    const rightAscensionHours = (
      (Math.atan2(equatorialY, equatorialX) * 12) / Math.PI + 24
    ) % 24;
    const declinationDegrees = (Math.asin(equatorialZ) * 180) / Math.PI;
    const horizontal = toHorizontal(rightAscensionHours, declinationDegrees);
    return {
      altitudeDegrees: horizontal.altitude,
      azimuthDegrees: horizontal.azimuth,
    };
  });
}

function createJ2000ToHorizontal(observedAt: Date, observer: Observer) {
  const rotation = Rotation_EQJ_EQD(observedAt).rot;
  return (rightAscensionHours: number, declinationDegrees: number) => {
    const rightAscension = (rightAscensionHours * Math.PI) / 12;
    const declination = (declinationDegrees * Math.PI) / 180;
    const x = Math.cos(declination) * Math.cos(rightAscension);
    const y = Math.cos(declination) * Math.sin(rightAscension);
    const z = Math.sin(declination);
    const rotatedX = rotation[0][0] * x + rotation[1][0] * y + rotation[2][0] * z;
    const rotatedY = rotation[0][1] * x + rotation[1][1] * y + rotation[2][1] * z;
    const rotatedZ = rotation[0][2] * x + rotation[1][2] * y + rotation[2][2] * z;
    const rightAscensionOfDate = (
      (Math.atan2(rotatedY, rotatedX) * 12) / Math.PI + 24
    ) % 24;
    const declinationOfDate = (
      Math.asin(Math.max(-1, Math.min(1, rotatedZ))) * 180
    ) / Math.PI;
    return Horizon(
      observedAt,
      observer,
      rightAscensionOfDate,
      declinationOfDate,
      "normal",
    );
  };
}

function validateInput(input: PlanetariumInput): void {
  if (!Number.isFinite(input.latitude) || input.latitude < -90 || input.latitude > 90) {
    throw new RangeError("Latitude must be between -90 and 90 degrees.");
  }
  if (!Number.isFinite(input.longitude) || input.longitude < -180 || input.longitude > 180) {
    throw new RangeError("Longitude must be between -180 and 180 degrees.");
  }
  if (Number.isNaN(input.observedAt.getTime())) {
    throw new RangeError("Observed time must be valid.");
  }
}

function requiredObject(
  objectById: ReadonlyMap<string, SkyObject>,
  id: string,
): SkyObject {
  const object = objectById.get(id);
  if (!object) {
    throw new Error(`Missing star catalogue entry: ${id}`);
  }
  return object;
}
