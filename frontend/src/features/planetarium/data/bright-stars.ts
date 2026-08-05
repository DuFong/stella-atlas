export type BrightStar = {
  id: string;
  name: string;
  rightAscensionHours: number;
  declinationDegrees: number;
  magnitude: number;
  color: string;
};

// Curated J2000 coordinates for the bright stars used by the initial sky view.
// This intentionally remains a small, reviewable catalogue instead of bundling
// third-party sky-culture datasets with unclear redistribution terms.
export const BRIGHT_STARS: readonly BrightStar[] = [
  { id: "sirius", name: "시리우스", rightAscensionHours: 6.7525, declinationDegrees: -16.7161, magnitude: -1.46, color: "#dcecff" },
  { id: "canopus", name: "카노푸스", rightAscensionHours: 6.3992, declinationDegrees: -52.6957, magnitude: -0.74, color: "#fff1d2" },
  { id: "arcturus", name: "아르크투루스", rightAscensionHours: 14.261, declinationDegrees: 19.1824, magnitude: -0.05, color: "#ffd19a" },
  { id: "vega", name: "베가", rightAscensionHours: 18.6156, declinationDegrees: 38.7837, magnitude: 0.03, color: "#dcecff" },
  { id: "capella", name: "카펠라", rightAscensionHours: 5.2782, declinationDegrees: 45.998, magnitude: 0.08, color: "#fff0b8" },
  { id: "rigel", name: "리겔", rightAscensionHours: 5.2423, declinationDegrees: -8.2016, magnitude: 0.13, color: "#cfe4ff" },
  { id: "procyon", name: "프로키온", rightAscensionHours: 7.655, declinationDegrees: 5.225, magnitude: 0.34, color: "#fff8e7" },
  { id: "betelgeuse", name: "베텔게우스", rightAscensionHours: 5.9195, declinationDegrees: 7.4071, magnitude: 0.42, color: "#ffb080" },
  { id: "altair", name: "알타이르", rightAscensionHours: 19.8464, declinationDegrees: 8.8683, magnitude: 0.77, color: "#f2f7ff" },
  { id: "aldebaran", name: "알데바란", rightAscensionHours: 4.5987, declinationDegrees: 16.5093, magnitude: 0.86, color: "#ffc080" },
  { id: "antares", name: "안타레스", rightAscensionHours: 16.4901, declinationDegrees: -26.432, magnitude: 0.96, color: "#ff9d78" },
  { id: "spica", name: "스피카", rightAscensionHours: 13.4199, declinationDegrees: -11.1613, magnitude: 0.98, color: "#d7e7ff" },
  { id: "pollux", name: "폴룩스", rightAscensionHours: 7.7553, declinationDegrees: 28.0262, magnitude: 1.14, color: "#ffd19a" },
  { id: "fomalhaut", name: "포말하우트", rightAscensionHours: 22.9608, declinationDegrees: -29.6222, magnitude: 1.16, color: "#eef5ff" },
  { id: "deneb", name: "데네브", rightAscensionHours: 20.6905, declinationDegrees: 45.2803, magnitude: 1.25, color: "#e5efff" },
  { id: "regulus", name: "레굴루스", rightAscensionHours: 10.1395, declinationDegrees: 11.9672, magnitude: 1.35, color: "#dcecff" },
  { id: "castor", name: "카스토르", rightAscensionHours: 7.5767, declinationDegrees: 31.8883, magnitude: 1.58, color: "#e4efff" },
  { id: "polaris", name: "북극성", rightAscensionHours: 2.5303, declinationDegrees: 89.2641, magnitude: 1.98, color: "#fff4d8" },
  { id: "bellatrix", name: "벨라트릭스", rightAscensionHours: 5.4189, declinationDegrees: 6.3497, magnitude: 1.64, color: "#d6e8ff" },
  { id: "alnilam", name: "알닐람", rightAscensionHours: 5.6036, declinationDegrees: -1.2019, magnitude: 1.69, color: "#d2e5ff" },
  { id: "alnitak", name: "알니타크", rightAscensionHours: 5.6793, declinationDegrees: -1.9426, magnitude: 1.74, color: "#d9e9ff" },
  { id: "mintaka", name: "민타카", rightAscensionHours: 5.5334, declinationDegrees: -0.2991, magnitude: 2.23, color: "#d9e9ff" },
  { id: "saiph", name: "사이프", rightAscensionHours: 5.7959, declinationDegrees: -9.6696, magnitude: 2.06, color: "#d6e8ff" },
  { id: "dubhe", name: "두베", rightAscensionHours: 11.0621, declinationDegrees: 61.7508, magnitude: 1.79, color: "#ffe1b5" },
  { id: "merak", name: "메라크", rightAscensionHours: 11.0307, declinationDegrees: 56.3824, magnitude: 2.37, color: "#e8f1ff" },
  { id: "phecda", name: "페크다", rightAscensionHours: 11.8972, declinationDegrees: 53.6948, magnitude: 2.44, color: "#e6efff" },
  { id: "megrez", name: "메그레즈", rightAscensionHours: 12.257, declinationDegrees: 57.0326, magnitude: 3.31, color: "#f5f8ff" },
  { id: "alioth", name: "알리오트", rightAscensionHours: 12.9005, declinationDegrees: 55.9598, magnitude: 1.77, color: "#e5efff" },
  { id: "mizar", name: "미자르", rightAscensionHours: 13.3987, declinationDegrees: 54.9254, magnitude: 2.23, color: "#edf4ff" },
  { id: "alkaid", name: "알카이드", rightAscensionHours: 13.7923, declinationDegrees: 49.3133, magnitude: 1.86, color: "#d8eaff" },
] as const;

export const CONSTELLATIONS = [
  {
    id: "ori",
    name: "오리온자리",
    segments: [
      ["betelgeuse", "bellatrix"],
      ["betelgeuse", "alnitak"],
      ["bellatrix", "mintaka"],
      ["alnitak", "alnilam"],
      ["alnilam", "mintaka"],
      ["alnitak", "saiph"],
      ["mintaka", "rigel"],
      ["saiph", "rigel"],
    ],
  },
  {
    id: "uma",
    name: "큰곰자리",
    segments: [
      ["dubhe", "merak"],
      ["merak", "phecda"],
      ["phecda", "megrez"],
      ["megrez", "dubhe"],
      ["megrez", "alioth"],
      ["alioth", "mizar"],
      ["mizar", "alkaid"],
    ],
  },
  {
    id: "summer-triangle",
    name: "여름철 대삼각형",
    segments: [
      ["vega", "deneb"],
      ["deneb", "altair"],
      ["altair", "vega"],
    ],
  },
] as const;
