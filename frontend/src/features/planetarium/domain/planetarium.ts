export type PlanetariumLocation = {
  latitude: number;
  longitude: number;
};

export type PlanetariumInput = PlanetariumLocation & {
  observedAt: Date;
};

export type SkyObjectKind = "STAR" | "SUN" | "MOON" | "PLANET";

export type SkyObject = {
  id: string;
  name: string;
  kind: SkyObjectKind;
  altitudeDegrees: number;
  azimuthDegrees: number;
  magnitude?: number;
  color: string;
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
