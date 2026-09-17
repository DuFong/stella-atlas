export type PlanetariumLocation = {
  latitude: number;
  longitude: number;
};

export type PlanetariumInput = PlanetariumLocation & {
  observedAt: Date;
};

export type SkyObjectKind =
  | "STAR"
  | "SUN"
  | "MOON"
  | "PLANET"
  | "GALAXY"
  | "NEBULA"
  | "CLUSTER";

export type SkyObject = {
  id: string;
  name: string;
  kind: SkyObjectKind;
  altitudeDegrees: number;
  azimuthDegrees: number;
  magnitude?: number;
  angularSizeArcMinutes?: number;
  color: string;
  aliases?: readonly string[];
  labelEligible?: boolean;
};

export type ConstellationSegment = {
  constellationId: string;
  constellationName: string;
  from: SkyObject;
  to: SkyObject;
};

export type HorizontalPoint = {
  altitudeDegrees: number;
  azimuthDegrees: number;
};

export type PlanetariumScene = {
  observedAt: string;
  latitude: number;
  longitude: number;
  objects: SkyObject[];
  constellationSegments: ConstellationSegment[];
  milkyWayPoints: HorizontalPoint[];
};

export type PlanetariumViewState = {
  bearingDegrees: number;
  altitudeDegrees: number;
  fieldOfViewDegrees: number;
  selectedObjectId?: string;
  quality: "full" | "reduced";
};

export interface PlanetariumEngine {
  calculate(input: PlanetariumInput): PlanetariumScene;
}
