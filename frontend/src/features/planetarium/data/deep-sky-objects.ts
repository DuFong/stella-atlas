import type { SkyObjectKind } from "@/features/planetarium/domain/planetarium";

export type DeepSkyObject = {
  id: string;
  name: string;
  aliases: readonly string[];
  kind: Extract<SkyObjectKind, "GALAXY" | "NEBULA" | "CLUSTER">;
  rightAscensionHours: number;
  declinationDegrees: number;
  magnitude?: number;
  angularSizeArcMinutes?: number;
  color: string;
  labelEligible: boolean;
};

export type DeepSkyCatalogRow = [
  catalogName: string,
  kind: "G" | "N" | "C",
  rightAscensionHours: number,
  declinationDegrees: number,
  magnitude: number | null,
  angularSizeArcMinutes: number | null,
  commonNames: string,
  messierNumber: number | null,
];

const KOREAN_NAMES: Readonly<Record<string, string>> = {
  M1: "게 성운", M8: "석호 성운", M13: "헤르쿨레스 구상성단", M20: "삼렬 성운",
  M27: "아령 성운", M31: "안드로메다 은하", M33: "삼각형자리 은하", M42: "오리온 성운",
  M44: "프레세페 성단", M45: "플레이아데스 성단", M51: "소용돌이 은하", M57: "고리 성운",
  M81: "보데 은하", M82: "시가 은하", M101: "바람개비 은하", M104: "솜브레로 은하",
  B033: "말머리 성운", NGC7000: "북아메리카 성운",
};

export const DEEP_SKY_OBJECTS: readonly DeepSkyObject[] = [];

export function buildDeepSkyObjects(rows: readonly DeepSkyCatalogRow[]): DeepSkyObject[] {
  return rows.map((row) => {
    const [
      catalogName,
      compactKind,
      rightAscensionHours,
      declinationDegrees,
      magnitude,
      angularSizeArcMinutes,
      commonNames,
      messierNumber,
    ] = row;
    const messierName = messierNumber === null ? undefined : `M${messierNumber}`;
    const koreanName = KOREAN_NAMES[messierName ?? catalogName];
    const primaryCommonName = commonNames.split(",")[0] || undefined;
    const designation = messierName ?? catalogName.replace(/^([A-Z]+)0+/, "$1");
    return {
      id: `dso-${catalogName.toLowerCase()}`,
      name: koreanName ?? (primaryCommonName ? `${primaryCommonName} (${designation})` : designation),
      aliases: uniqueStrings([catalogName, designation, messierName ?? "", ...commonNames.split(",")]),
      kind: deepSkyKind(compactKind),
      rightAscensionHours,
      declinationDegrees,
      magnitude: magnitude ?? undefined,
      angularSizeArcMinutes: angularSizeArcMinutes ?? undefined,
      color: deepSkyColor(compactKind),
      labelEligible: messierNumber !== null || Boolean(commonNames),
    };
  });
}

function uniqueStrings(values: readonly string[]): string[] {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

function deepSkyKind(kind: "G" | "N" | "C"): DeepSkyObject["kind"] {
  switch (kind) {
    case "G": return "GALAXY";
    case "N": return "NEBULA";
    case "C": return "CLUSTER";
  }
}

function deepSkyColor(kind: "G" | "N" | "C"): string {
  return { G: "#a9b8ff", N: "#75d6c2", C: "#ffe1a8" }[kind];
}
