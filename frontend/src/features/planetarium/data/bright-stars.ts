export type BrightStar = {
  id: string;
  name: string;
  aliases: readonly string[];
  hipparcosId?: number;
  rightAscensionHours: number;
  declinationDegrees: number;
  magnitude: number;
  color: string;
  labelEligible: boolean;
};

export type CatalogStarRow = [
  catalogId: number,
  hipparcosId: number,
  properName: string,
  bayerFlamsteed: string,
  rightAscensionHours: number,
  declinationDegrees: number,
  magnitude: number,
  colorIndex: number | null,
];

export type CatalogConstellationRow = [
  id: string,
  name: string,
  segments: [fromHipparcosId: number, toHipparcosId: number][],
];

export type ConstellationDefinition = {
  id: string;
  name: string;
  segments: readonly (readonly [fromId: string, toId: string])[];
};

export const BRIGHT_STARS: readonly BrightStar[] = [
  star("sirius", "시리우스", 32349, 6.7525, -16.7161, -1.46, "#dcecff"),
  star("canopus", "카노푸스", 30438, 6.3992, -52.6957, -0.74, "#fff1d2"),
  star("arcturus", "아르크투루스", 69673, 14.261, 19.1824, -0.05, "#ffd19a"),
  star("vega", "베가", 91262, 18.6156, 38.7837, 0.03, "#dcecff"),
  star("capella", "카펠라", 24608, 5.2782, 45.998, 0.08, "#fff0b8"),
  star("rigel", "리겔", 24436, 5.2423, -8.2016, 0.13, "#cfe4ff"),
  star("procyon", "프로키온", 37279, 7.655, 5.225, 0.34, "#fff8e7"),
  star("betelgeuse", "베텔게우스", 27989, 5.9195, 7.4071, 0.42, "#ffb080"),
  star("altair", "알타이르", 97649, 19.8464, 8.8683, 0.77, "#f2f7ff"),
  star("aldebaran", "알데바란", 21421, 4.5987, 16.5093, 0.86, "#ffc080"),
  star("antares", "안타레스", 80763, 16.4901, -26.432, 0.96, "#ff9d78"),
  star("spica", "스피카", 65474, 13.4199, -11.1613, 0.98, "#d7e7ff"),
  star("pollux", "폴룩스", 37826, 7.7553, 28.0262, 1.14, "#ffd19a"),
  star("fomalhaut", "포말하우트", 113368, 22.9608, -29.6222, 1.16, "#eef5ff"),
  star("deneb", "데네브", 102098, 20.6905, 45.2803, 1.25, "#e5efff"),
  star("regulus", "레굴루스", 49669, 10.1395, 11.9672, 1.35, "#dcecff"),
  star("castor", "카스토르", 36850, 7.5767, 31.8883, 1.58, "#e4efff"),
  star("polaris", "북극성", 11767, 2.5303, 89.2641, 1.98, "#fff4d8"),
  star("bellatrix", "벨라트릭스", 25336, 5.4189, 6.3497, 1.64, "#d6e8ff"),
  star("alnilam", "알닐람", 26311, 5.6036, -1.2019, 1.69, "#d2e5ff"),
  star("alnitak", "알니타크", 26727, 5.6793, -1.9426, 1.74, "#d9e9ff"),
  star("mintaka", "민타카", 25930, 5.5334, -0.2991, 2.23, "#d9e9ff"),
  star("saiph", "사이프", 27366, 5.7959, -9.6696, 2.06, "#d6e8ff"),
  star("dubhe", "두베", 54061, 11.0621, 61.7508, 1.79, "#ffe1b5"),
  star("merak", "메라크", 53910, 11.0307, 56.3824, 2.37, "#e8f1ff"),
  star("phecda", "페크다", 58001, 11.8972, 53.6948, 2.44, "#e6efff"),
  star("megrez", "메그레즈", 59774, 12.257, 57.0326, 3.31, "#f5f8ff"),
  star("alioth", "알리오트", 62956, 12.9005, 55.9598, 1.77, "#e5efff"),
  star("mizar", "미자르", 65378, 13.3987, 54.9254, 2.23, "#edf4ff"),
  star("alkaid", "알카이드", 67301, 13.7923, 49.3133, 1.86, "#d8eaff"),
];

export const CONSTELLATIONS: readonly ConstellationDefinition[] = [
  { id: "ori", name: "오리온자리", segments: [["betelgeuse", "bellatrix"], ["betelgeuse", "alnitak"], ["bellatrix", "mintaka"], ["alnitak", "alnilam"], ["alnilam", "mintaka"], ["alnitak", "saiph"], ["mintaka", "rigel"], ["saiph", "rigel"]] },
  { id: "uma", name: "큰곰자리", segments: [["dubhe", "merak"], ["merak", "phecda"], ["phecda", "megrez"], ["megrez", "dubhe"], ["megrez", "alioth"], ["alioth", "mizar"], ["mizar", "alkaid"]] },
  { id: "summer-triangle", name: "여름철 대삼각형", segments: [["vega", "deneb"], ["deneb", "altair"], ["altair", "vega"]] },
];

export function buildBrightStars(rows: readonly CatalogStarRow[]): BrightStar[] {
  return rows.map((row) => {
    const [catalogId, hipparcosId, properName, bayerFlamsteed, rightAscensionHours, declinationDegrees, magnitude, colorIndex] = row;
    const override = STAR_OVERRIDES[hipparcosId];
    const designation = formatDesignation(bayerFlamsteed);
    const fallbackName = hipparcosId ? `HIP ${hipparcosId}` : `HYG ${catalogId}`;
    return {
      id: override?.id ?? (hipparcosId ? `hip-${hipparcosId}` : `hyg-${catalogId}`),
      name: override?.name ?? (properName || designation || fallbackName),
      aliases: uniqueStrings([properName, designation, bayerFlamsteed, fallbackName]),
      hipparcosId: hipparcosId || undefined,
      rightAscensionHours,
      declinationDegrees,
      magnitude,
      color: colorForIndex(colorIndex),
      labelEligible: Boolean(override) || magnitude <= 1.5,
    };
  });
}

export function buildConstellations(
  rows: readonly CatalogConstellationRow[],
  stars: readonly BrightStar[],
): ConstellationDefinition[] {
  const starIdByHipparcosId = new Map(
    stars.flatMap((candidate) => candidate.hipparcosId ? [[candidate.hipparcosId, candidate.id] as const] : []),
  );
  return rows.map(([id, name, segments]) => ({
    id,
    name,
    segments: segments.map(([from, to]) => [requiredStarId(from), requiredStarId(to)] as const),
  }));

  function requiredStarId(hipparcosId: number): string {
    const id = starIdByHipparcosId.get(hipparcosId);
    if (!id) throw new Error(`Missing HYG entry for constellation star HIP ${hipparcosId}.`);
    return id;
  }
}

function star(id: string, name: string, hipparcosId: number, rightAscensionHours: number, declinationDegrees: number, magnitude: number, color: string): BrightStar {
  return { id, name, aliases: [`HIP ${hipparcosId}`], hipparcosId, rightAscensionHours, declinationDegrees, magnitude, color, labelEligible: true };
}

function formatDesignation(value: string): string {
  return value.replace(/(Alp|Bet|Gam|Del|Eps|Zet|Eta|The|Iot|Kap|Lam|Mu|Nu|Xi|Omi|Pi|Rho|Sig|Tau|Ups|Phi|Chi|Psi|Ome)/, greekLetter);
}

function colorForIndex(colorIndex: number | null): string {
  if (colorIndex === null) return "#f2f4ff";
  if (colorIndex < -0.1) return "#cfe4ff";
  if (colorIndex < 0.3) return "#e2edff";
  if (colorIndex < 0.6) return "#fff8e7";
  if (colorIndex < 0.9) return "#ffe6b8";
  if (colorIndex < 1.4) return "#ffc080";
  return "#ff9d78";
}

function uniqueStrings(values: readonly string[]): string[] {
  return [...new Set(values.filter(Boolean))];
}

function greekLetter(abbreviation: string): string {
  return ({ Alp: "α", Bet: "β", Gam: "γ", Del: "δ", Eps: "ε", Zet: "ζ", Eta: "η", The: "θ", Iot: "ι", Kap: "κ", Lam: "λ", Mu: "μ", Nu: "ν", Xi: "ξ", Omi: "ο", Pi: "π", Rho: "ρ", Sig: "σ", Tau: "τ", Ups: "υ", Phi: "φ", Chi: "χ", Psi: "ψ", Ome: "ω" } as Readonly<Record<string, string>>)[abbreviation] ?? abbreviation;
}

const STAR_OVERRIDES: Readonly<Record<number, { id: string; name: string }>> = Object.fromEntries(
  BRIGHT_STARS.map(({ hipparcosId, id, name }) => [hipparcosId, { id, name }]),
);
