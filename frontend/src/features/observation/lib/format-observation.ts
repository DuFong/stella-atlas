import type {
  ObservationGrade,
  TwilightPhase,
} from "@/features/observation/types/observation";

const gradeLabels: Record<ObservationGrade, string> = {
  EXCELLENT: "매우 좋음",
  GOOD: "좋음",
  FAIR: "보통",
  POOR: "나쁨",
};

const twilightLabels: Record<TwilightPhase, string> = {
  DAYLIGHT: "낮",
  CIVIL: "시민박명",
  NAUTICAL: "항해박명",
  ASTRONOMICAL: "천문박명",
  DARK: "완전한 밤",
};

export function formatGrade(grade: ObservationGrade): string {
  return gradeLabels[grade];
}

export function formatTwilight(phase: TwilightPhase): string {
  return twilightLabels[phase];
}

export function formatObservationDate(date: string): string {
  return new Intl.DateTimeFormat("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "short",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}

export function formatTime(value: string, timeZone: string): string {
  return new Intl.DateTimeFormat("ko-KR", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone,
  }).format(new Date(value));
}

export function formatWindow(
  start: string,
  end: string,
  timeZone: string,
): string {
  return `${formatTime(start, timeZone)} — ${formatTime(end, timeZone)}`;
}

export function formatPercent(value: number): string {
  return `${Math.round(value)}%`;
}

export function formatDistance(value: number): string {
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(value % 1_000 === 0 ? 0 : 1)} km`;
  }
  return `${Math.round(value)} m`;
}
