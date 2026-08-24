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

export type PlanetariumScene = {
  observedAt: string;
  latitude: number;
  longitude: number;
  objects: SkyObject[];
  constellationSegments: ConstellationSegment[];
};

export interface PlanetariumEngine {
  calculate(input: PlanetariumInput): PlanetariumScene;
}
