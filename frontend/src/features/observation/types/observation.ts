export type ObservationGrade = "EXCELLENT" | "GOOD" | "FAIR" | "POOR";

export type TwilightPhase =
  | "DAYLIGHT"
  | "CIVIL"
  | "NAUTICAL"
  | "ASTRONOMICAL"
  | "DARK";

export type HorizonState = "OCCURS" | "ALWAYS_ABOVE" | "ALWAYS_BELOW";

export type LunarVisibility = "NORMAL" | "ALWAYS_ABOVE" | "ALWAYS_BELOW";

export type ObservationReasonCode =
  | "MODERATE_CLOUD_COVER"
  | "HIGH_CLOUD_COVER"
  | "VERY_HIGH_CLOUD_COVER"
  | "MODERATE_PRECIPITATION_RISK"
  | "HIGH_PRECIPITATION_RISK"
  | "VERY_HIGH_PRECIPITATION_RISK"
  | "MODERATE_VISIBILITY"
  | "LOW_VISIBILITY"
  | "VERY_LOW_VISIBILITY"
  | "HIGH_HUMIDITY"
  | "VERY_HIGH_HUMIDITY"
  | "EXTREME_HUMIDITY"
  | "MODERATE_WIND"
  | "STRONG_WIND"
  | "VERY_STRONG_WIND"
  | "MODERATE_MOONLIGHT"
  | "BRIGHT_MOONLIGHT"
  | "VERY_BRIGHT_MOONLIGHT"
  | "ASTRONOMICAL_TWILIGHT"
  | "NAUTICAL_TWILIGHT"
  | "CIVIL_TWILIGHT"
  | "DAYLIGHT"
  | "IDEAL_CONDITIONS";

export type ObservationReason = {
  code: ObservationReasonCode;
  impact: number;
  message: string;
};

export type ObservationWindow = {
  start: string;
  end: string;
  averageScore: number;
};

export type SolarEvent = {
  time: string | null;
  state: HorizonState;
};

export type ObservationAstronomy = {
  sunrise: SolarEvent;
  sunset: SolarEvent;
  civilTwilightStart: SolarEvent;
  civilTwilightEnd: SolarEvent;
  nauticalTwilightStart: SolarEvent;
  nauticalTwilightEnd: SolarEvent;
  astronomicalTwilightStart: SolarEvent;
  astronomicalTwilightEnd: SolarEvent;
  moonrise: string | null;
  moonset: string | null;
  lunarVisibility: LunarVisibility;
  moonPhase: number;
  moonIllumination: number;
};

export type ObservationWeather = {
  temperatureCelsius: number;
  cloudCoverPercent: number;
  precipitationProbabilityPercent: number;
  humidityPercent: number;
  visibilityMeters: number;
  windSpeedMetersPerSecond: number;
};

export type HourlyObservation = {
  time: string;
  score: number;
  grade: ObservationGrade;
  recommended: boolean;
  twilightPhase: TwilightPhase;
  moonAboveHorizon: boolean;
  weather: ObservationWeather;
  reasons: ObservationReason[];
};

export type ObservationForecast = {
  location: {
    latitude: number;
    longitude: number;
    timezone: string;
  };
  date: string;
  summary: {
    score: number;
    grade: ObservationGrade;
    recommended: boolean;
    bestWindow: ObservationWindow | null;
    message: string;
  };
  astronomy: ObservationAstronomy;
  hourly: HourlyObservation[];
  generatedAt: string;
};

export type ObservationQuery = {
  latitude: string;
  longitude: string;
  date: string;
};

export type ObservationApiError = {
  code: string;
  message: string;
};

export type ObservationApiResult =
  | { ok: true; data: ObservationForecast }
  | { ok: false; error: ObservationApiError };
