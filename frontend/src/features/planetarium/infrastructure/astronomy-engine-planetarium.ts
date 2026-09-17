import {
  Body,
  Equator,
  Horizon,
  Observer,
} from "astronomy-engine";
import {
  BRIGHT_STARS,
  CONSTELLATIONS,
} from "@/features/planetarium/data/bright-stars";
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
  calculate(input: PlanetariumInput): PlanetariumScene {
    validateInput(input);
    const observer = new Observer(input.latitude, input.longitude, 0);
    const stars = BRIGHT_STARS.map((star): SkyObject => {
      const horizontal = Horizon(
        input.observedAt,
        observer,
        star.rightAscensionHours,
        star.declinationDegrees,
        "normal",
      );

      return {
        id: star.id,
        name: star.name,
        kind: "STAR",
        altitudeDegrees: horizontal.altitude,
        azimuthDegrees: horizontal.azimuth,
        magnitude: star.magnitude,
        color: star.color,
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
    const objects = [...solarSystem, ...stars];
    const objectById = new Map(objects.map((object) => [object.id, object]));
    const constellationSegments = CONSTELLATIONS.flatMap((constellation) =>
      constellation.segments.map(([fromId, toId]) => ({
        constellationId: constellation.id,
        constellationName: constellation.name,
        from: requiredObject(objectById, fromId),
        to: requiredObject(objectById, toId),
      })),
    );
    const milkyWayPoints = calculateMilkyWayPoints(input.observedAt, observer);

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
  observedAt: Date,
  observer: Observer,
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
    const horizontal = Horizon(
      observedAt,
      observer,
      rightAscensionHours,
      declinationDegrees,
      "normal",
    );
    return {
      altitudeDegrees: horizontal.altitude,
      azimuthDegrees: horizontal.azimuth,
    };
  });
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
